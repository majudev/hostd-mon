import express, { Request, Response, NextFunction, Router } from 'express';
import { createClient } from 'redis';
import { performance } from 'perf_hooks';

const router: Router = express.Router();

interface LastSeenRequest {
    hosts: string[];
};

router.post('/lastseen', async (req: Request, res: Response) => {    
    const request : LastSeenRequest = req.body;

    const client = createClient({
        url: "localhost:6379"
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

export default router;
