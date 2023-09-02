import express, { Request, Response, NextFunction, Router } from 'express';
import { createClient } from 'redis';
import { performance } from 'perf_hooks';

const router: Router = express.Router();

interface LastSeenRequest {
    hosts: string[];
};

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
    console.log('Listing cache entries: found ' + keys.length + ' keys, took ' + (endTime-startTime).toFixed(3) + 'ms');

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
            ...previousValue,
            [key]: value,
        };
    }, {});

    request.delete.forEach(async (value: string, index: number, array: string[]) => {
        await incoming.del(value);
    });

    await incoming.disconnect();

    const endTime = performance.now();
    console.log('Flushing cache entries: deleted ' + request.delete + ' keys, retrieved ' + request.get + ' keys, took ' + (endTime-startTime).toFixed(3) + 'ms');

    res.status(200);
    res.json(returnSet);
    res.end();
});

export default router;
