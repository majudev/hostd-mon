import express, { Request, Response, NextFunction, Router } from 'express';
import crypto from 'crypto';
import secp256k1 from 'secp256k1';
import { createClient } from 'redis';
import fetch from 'node-fetch';
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
    const request : PingRequest = req.body;
    const data = JSON.parse(request.data) as PingData;
    
    const client = createClient({
        url: process.env.REDIS
    });
    await client.connect();

    var pubkeyAllowedRoot = await client.get('allowed.' + request.pubkey);
    if(pubkeyAllowedRoot == null){
        const response = await fetch((process.env.MASTER_URL as string) + '/host/by-extramon-pubkey/' + encodeURIComponent(request.pubkey) + '/allowed');
        const status = await response.status;
        //const body = await response.text();
        pubkeyAllowedRoot = 'false';
        if(Math.floor(status/100) == 2){
            pubkeyAllowedRoot = 'true';
            await client.set('allowed.' + request.pubkey, pubkeyAllowedRoot as string);
        }
    }

    await client.disconnect();

    const pubkeyAllowed = (pubkeyAllowedRoot === 'true');
    if(!pubkeyAllowed){
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
        res.status(401);
        res.end();
        return;
    }

    const incoming = createClient({
        url: process.env.INCOMING_CACHE
    });
    await incoming.connect();
    const cacheHash = crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');
    await incoming.set('ping.' + cacheHash, JSON.stringify(request));
    await incoming.disconnect();

    /*await client.set('lastSeen.' + request.pubkey, data.timestamp);
    var clientEntries = await client.get('pings.' + request.pubkey);
    if(clientEntries == null){
        clientEntries = JSON.stringify([]);
    }
    var clientEntriesObject = JSON.parse(clientEntries) as {
        timestamp: number,
    }[];
    clientEntriesObject.push({ timestamp: data.timestamp });
    await client.set('pings.' + request.pubkey, JSON.stringify(clientEntriesObject));*/

    res.status(200);
    res.end();
});

export default router;
