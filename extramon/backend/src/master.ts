import express, { Request, Response, NextFunction, Router } from 'express';
import logger from './utils/logger';
import { createClient } from 'redis';
import { performance } from 'perf_hooks';

const router: Router = express.Router();

interface CacheUpdateRequest {
    get: string[];
    delete: string[];
};

router.get('/cache', async (req: Request, res: Response) => {    
    const startTime = performance.now();

    const incoming = createClient({
        url: process.env.INCOMING_CACHE
    });
    await incoming.connect();
    const keys = await incoming.keys('*');
    await incoming.disconnect();

    const endTime = performance.now();
    logger.debug('Listing cache entries: found ' + keys.length + ' keys, took ' + (endTime-startTime).toFixed(3) + 'ms');

    res.status(200);
    res.json(keys);
    res.end();
});

router.post('/cache-update', async (req: Request, res: Response) => {
    const startTime = performance.now(); 
    const request: CacheUpdateRequest = req.body;

    if(request.delete === undefined || request.get === undefined){
        res.status(400);
        res.end();
    }

    const incoming = createClient({
        url: process.env.INCOMING_CACHE
    });
    await incoming.connect();

    const returnSet = request.get.reduce(async (previousValue, currentValue) => {
        const key = currentValue;
        const value = await incoming.getDel(key);
        return {
            ...await previousValue,
            [key]: value,
        };
    }, {});

    request.delete.forEach(async (value: string, index: number, array: string[]) => {
        await incoming.del(value);
    });

    await incoming.disconnect();

    const endTime = performance.now();
    logger.debug('Flushing cache entries: deleted ' + request.delete.length + ' keys, retrieved ' + request.get.length + ' keys, took ' + (endTime-startTime).toFixed(3) + 'ms');

    res.status(200);
    res.json(returnSet);
    res.end();
});

router.delete('/invalidate-pubkey/:pubkey', async (req: Request, res: Response) => {
    const startTime = performance.now(); 
    const pubkey: string = req.params.pubkey;

    const client = createClient({
        url: process.env.REDIS
    });
    await client.connect();
    await client.del('allowed.' + pubkey);
    await client.disconnect();

    const endTime = performance.now();
    console.log('Invalidated pubkey ' + pubkey + ', took ' + (endTime-startTime).toFixed(3) + 'ms');

    res.status(200);
    res.end();
});

export default router;
