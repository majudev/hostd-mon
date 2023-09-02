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

router.post('/lastseen', async (req: Request, res: Response) => {    
    const request : LastSeenRequest = req.body;

    const client = createClient({
        url: process.env.REDIS
    });
    await client.connect();

    var response = request.hosts.reduce(async (previous, current) => {
        const host = current;
        const historyJSON = await client.get('pings.' + host);
        await client.del('pings.' + host);
        const history = (historyJSON != null) ? JSON.parse(historyJSON) : {};
        return {
            ...previous,
            [current] : history,
        };
    }, {});

    res.status(200);
    res.json(response);
    res.end();
});

router.get('/cache', async (req: Request, res: Response) => {    
    const incoming = createClient({
        url: process.env.INCOMING_CACHE
    });
    await incoming.connect();

    const keys = await incoming.keys('*');

    await incoming.disconnect();

    res.status(200);
    res.json(keys);
    res.end();
});

router.post('/cache-update', async (req: Request, res: Response) => {    
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

    res.status(200);
    res.json(returnSet);
    res.end();
});

export default router;
