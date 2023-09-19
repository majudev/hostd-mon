import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

import uptimeRouter from './uptime';

const router = Router();
const prisma = new PrismaClient();

router.use('/:hostId/uptime', uptimeRouter);

interface NewHostRequest {
    rhpAddress: string | undefined;
    rhpPubkey: string | undefined;
    extramonPubkey: string | undefined;
};

interface LoginUserRequest {
    email: string;
};

router.post('/new', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const request: NewHostRequest = req.body;

    if(request.extramonPubkey === undefined && (request.rhpAddress === undefined || request.rhpPubkey === undefined)) {
        res.json({
            status: "error",
            message: "please provide rhpAddress and rhpPubkey OR extramonPubkey",
        }).status(400);
        return;
    }

    /*const exists = await prisma.host.count({
        where: {
            OR: [
                {
                    rhpAddress: request.rhpAddress,
                    rhpPubkey: request.rhpPubkey,
                },
                {
                    extramonPubkey: request.extramonPubkey,
                }
            ]
        }
    }) > 0;

    if(exists) {
        res.json({
            status: "error",
            message: "host with this data already exists",
        }).status(409);
        return;
    }*/

    /*await prisma.host.create({
        data: {
            email: request.email,
            name: null,
        },
    });*/

	res.json({
		status: "success",
	}).status(201);
});

export default router;
