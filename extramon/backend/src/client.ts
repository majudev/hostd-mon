import express, { Request, Response, NextFunction, Router } from 'express';
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
    const request : PingRequest = req.body;
    const data = JSON.parse(request.data) as PingData;
    
    const client = createClient({
        url: "redis://localhost:6379"
    });
    await client.connect();

    var host = await client.get('host.' + request.pubkey);
    if(host == null){
        // TODO: retrieve key from master
        host = '...';
        if(false){
            res.status(401);
            res.end();
            return;
        }
        await client.set('host.' + request.pubkey, host as string);
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

    await client.set('lastSeen.' + host, data.timestamp);
    var clientEntries = await client.get('pings.' + host);
    if(clientEntries == null){
        clientEntries = JSON.stringify([]);
    }
    var clientEntriesObject = JSON.parse(clientEntries) as {
        timestamp: number,
    }[];
    clientEntriesObject.push({ timestamp: data.timestamp });
    await client.set('pings.' + host, JSON.stringify(clientEntriesObject));

    res.status(200);
    res.end();
});

export default router;
