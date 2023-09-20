import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

import uptimeRouter from './uptime';

const router = Router();
const prisma = new PrismaClient();

router.use('/:hostId/uptime', uptimeRouter);

interface LoginUserRequest {
    email: string;
};

router.post('/new', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const {
        id: _,
        userId: __,
        User: ___,
        RHPUptimeEntries: ____,
        ExtramonUptimeEntries: _____,
        Alerts: ______,
        ...request
    } = req.body;

    request.userId = res.locals.auth_user.userId;
    if(res.locals.auth_user.admin && req.body.userId !== undefined){
        request.userId = req.body.userId;
    }

    if(request.extramonPubkey === undefined && (request.rhpAddress === undefined || request.rhpPubkey === undefined)) {
        res.status(400).json({
            status: "error",
            message: "please provide rhpAddress and rhpPubkey OR extramonPubkey",
        });
        return;
    }

    const exists = await prisma.host.count({
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
        res.status(409).json({
            status: "error",
            message: "host with this data already exists",
        });
        return;
    }

    const host = await prisma.host.create({
        data: request,
    });

	res.status(201).json({
		status: "success",
        host: host,
	});
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

router.patch('/:hostId', async (req: Request, res: Response) => {
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

    // User can edit only his own hosts, admin can edit everything
    const hostOwner = await prisma.host.count({
        where:{
            userId: res.locals.auth_user.userId,
            id: hostId,
        }
    }) > 0;
    if(!hostOwner && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to edit this hostId",
        }).end();
        return;
    }

    const exists = await prisma.host.count({
        where: {
            id: hostId,
        }
    }) > 0;

    if(!exists){
        res.status(404).json({
            status: "error",
            message: "host with id " + hostId + " not found",
        });
        return;
    }

    const {
        id: _,
        userId: __,
        User: ___,
        RHPUptimeEntries: ____,
        ExtramonUptimeEntries: _____,
        Alerts: ______,
        ...updateQuery
    } = req.body;

    if(updateQuery === undefined || Object.keys(updateQuery).length == 0){
        res.status(400).json({
            status: "error",
            message: "bad body provided",
        });
        return;
    }

    /*if(updatedObject.extramonPubkey === undefined && (updatedObject.rhpAddress === undefined || updatedObject.rhpPubkey === undefined)) {
        res.status(400).json({
            status: "error",
            message: "please provide rhpAddress and rhpPubkey OR extramonPubkey",
        });
        return;
    }*/

    const updatedObject = await prisma.host.update({
        where: {
            id: hostId,
        },
        data: updateQuery,
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

    res.status(200).json(updatedObject).end();
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

router.delete('/:hostId', async (req: Request, res: Response) => {
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
            message: "you don't have permissions to delete this hostId",
        }).end();
        return;
    }

    await prisma.host.delete({
        where: {
            id: hostId,
        },
    });

    res.status(204).end();
});

export default router;
