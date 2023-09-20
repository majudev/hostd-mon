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

router.get('/:hostId', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const hostId = Number.parseInt(req.params.hostId);

    if(!Number.isInteger(hostId)) {
        res.status(400).json({
            status: "error",
            message: "please provide hostId",
        });
        return;
    }

    // User can view only his own hosts, admin can view everything
    const hostOwner = await prisma.host.count({
        where:{
            userId: res.locals.auth_user.userId,
            id: hostId,
        }
    }) > 0;
    if(!hostOwner && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to view this hostId",
        }).end();
        return;
    }

    const host = await prisma.host.findFirst({
        where: {
            id: hostId,
        },
        select: {
            id: true,
            name: true,
            rhpAddress: true,
            rhpPubkey: true,
            extramonPubkey: true,

            rhpDeadtime: true,
            extramonDeadtime: true,
        },
    });

    if(host === null){
        res.status(404).json({
            status: "error",
            message: "host with id " + hostId + " not found",
        });
        return;
    }

    res.status(200).json(host).end();
});

router.get('/:hostId/alerts', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const hostId = Number.parseInt(req.params.hostId);

    if(!Number.isInteger(hostId)) {
        res.status(400).json({
            status: "error",
            message: "please provide hostId",
        });
        return;
    }

    // User can view only his own hosts, admin can view everything
    const hostOwner = await prisma.host.count({
        where:{
            userId: res.locals.auth_user.userId,
            id: hostId,
        }
    }) > 0;
    if(!hostOwner && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to view this hostId",
        }).end();
        return;
    }

    const alerts = await prisma.alert.findMany({
        where: {
            hostId: hostId,
        },
        select: {
            id: true,
            timestamp: true,
            message: true,
            sentTo: true,
            Host: {
                select: {
                    id: true,
                    name: true,
                }
            }
        },
    });

    res.status(200).json(alerts).end();
});

export default router;
