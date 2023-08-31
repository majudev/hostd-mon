import express, { Request, Response, NextFunction, Router } from 'express';
import * as elliptic from 'elliptic';
import { createClient } from 'redis';
import { performance } from 'perf_hooks';

const router: Router = express.Router();

const ec = new elliptic.ec('secp256k1');

interface PingRequest {
    data: string;
    signature: string;
};

interface PingData {
    host: string;
    timestamp: number;
}

router.post('/ping', async (req: Request, res: Response) => {
    const request : PingRequest = req.body;
    const data = JSON.parse(request.data) as PingData;
    
    const client = createClient({
        url: "localhost:6379"
    });
    await client.connect();

    var signingKey = await client.get('signingKey.' + data.host);
    if(signingKey == null){
        // TODO: retrieve key from master
        signingKey = '...';
        await client.set('signingKey.' + data.host, signingKey as string);
    }

    const pubKey = ec.keyFromPublic(signingKey as string);
    const isValid = pubKey.verify(request.data, request.signature);

    if(!isValid){
        res.status(401);
        res.end();
        return;
    }

    await client.set('lastSeen.' + data.host, data.timestamp);
    var clientEntries = await client.get('pings.' + data.host);
    if(clientEntries == null){
        clientEntries = JSON.stringify([]);
    }
    var clientEntriesObject = JSON.parse(clientEntries) as {
        timestamp: number,
    }[];
    clientEntriesObject.push({ timestamp: data.timestamp });
    await client.set('pings.' + data.host, JSON.stringify(clientEntriesObject));

    res.status(200);
    res.end();
});

export default router;
