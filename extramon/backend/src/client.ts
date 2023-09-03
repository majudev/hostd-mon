import express, { Request, Response, NextFunction, Router } from 'express';
import logger from './utils/logger';
import crypto from 'crypto';
import secp256k1 from 'secp256k1';
import { createClient } from 'redis';
import { performance } from 'perf_hooks';

const router: Router = express.Router();

interface PingRequest {
    data: string;
    signature: string;
    pubkey: string;
};

interface PingData {
    timestamp: number;
}

router.post('/ping', async (req: Request, res: Response) => {
    const startTime = performance.now(); 
    const request : PingRequest = req.body;

    if(request.data === undefined || request.signature === undefined || request.pubkey === undefined){
        res.status(400).end();
        return;
    }

    const data = JSON.parse(request.data) as PingData;

    if(data.timestamp === undefined){
        res.status(400).end();
        return;
    }

    logger.debug('Got ping request signed using pubkey ' + request.pubkey);
    
    const client = createClient({
        url: process.env.REDIS
    });
    await client.connect();

    var pubkeyAllowedRoot = await client.get('allowed.' + request.pubkey);
    if(pubkeyAllowedRoot == null){
        logger.debug('Pubkey not in cache, retrieving from upstream...');

        const response = await fetch((process.env.MASTER_URL as string) + '/api/satellites/host/by-extramon-pubkey/' + encodeURIComponent(request.pubkey) + '/allowed');
        const status = await response.status;
        //const body = await response.text();
        pubkeyAllowedRoot = 'false';
        if(Math.floor(status/100) == 2){
            pubkeyAllowedRoot = 'true';
            await client.set('allowed.' + request.pubkey, pubkeyAllowedRoot as string);
        }
    }

    await client.quit();

    const pubkeyAllowed = (pubkeyAllowedRoot === 'true');
    if(!pubkeyAllowed){
        logger.debug('Pubkey not registered');
        res.status(401);
        res.end();
        return;
    }

    const pubkey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(request.pubkey, 'hex')), true);
    //console.log(pubkey);
    //console.log(Buffer.from(pubkey).toString('hex'));
    const hash = crypto.createHash('sha256').update(request.data).digest();
    //console.log(hash);
    //console.log(hash.toString('hex'));
    const isValid = secp256k1.ecdsaVerify(Uint8Array.from(Buffer.from(request.signature, 'hex')), hash, pubkey);

    if(!isValid){
        logger.debug('Signature invalid');
        res.status(401);
        res.end();
        return;
    }

    logger.debug('Storing in incoming cache');
    const incoming = createClient({
        url: process.env.INCOMING_CACHE
    });
    await incoming.connect();
    const cacheHash = crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');
    await incoming.set('ping.' + cacheHash, JSON.stringify(request));
    await incoming.quit();

    const endTime = performance.now();
    logger.debug('Ping request took ' + (endTime-startTime).toFixed(3) + 'ms');

    res.status(200);
    res.end();
});

export default router;
