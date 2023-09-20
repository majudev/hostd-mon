import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

router.get('/:id', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const userId: number = parseInt(req.params.id);

    if(Number.isNaN(userId)) {
        res.status(400).json({
            status: "error",
            message: "please provide userId",
        });
        return;
    }

    // User can only view his hosts, admin can view everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to view this userId",
        }).end();
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            admin: true,
            alertEmail: true,
            alertPhoneNumber: true,
            globallyDisableEmailAlerts: true,
            globallyDisablePhoneAlerts: true,
            Hosts: {
                select: {
                    id: true,
                },
            },
        },
    });

    if(user === null){
        res.status(404).json({
            status: "error",
            message: "user with id " + userId + " not found",
        });
        return;
    }

    res.status(200).json(user).end();
});

router.patch('/:userId', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const userId: number = parseInt(req.params.userId);

    if(Number.isNaN(userId)) {
        res.status(400).json({
            status: "error",
            message: "please provide userId",
        });
        return;
    }

    // User can only edit himself, admin can edit everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to edit this userId",
        }).end();
        return;
    }

    const exists = await prisma.user.count({
        where: {
            id: userId,
        }
    }) > 0;

    if(!exists){
        res.status(404).json({
            status: "error",
            message: "user with id " + userId + " not found",
        });
        return;
    }

    const {
        id: _,
        admin: __,
        Hosts: ___,
        Alerts: ____,
        email: _____,
        ...updateQuery
    } = req.body;
    if(res.locals.auth_user.admin && 'admin' in req.body){
        updateQuery.admin = req.body.admin;
    }

    if(updateQuery === undefined || Object.keys(updateQuery).length == 0){
        res.status(400).json({
            status: "error",
            message: "bad body provided",
        });
        return;
    }

    const updatedObject = await prisma.user.update({
        where: {
            id: userId,
        },
        data: updateQuery,
        select: {
            id: true,
            name: true,
            email: true,
            admin: true,
            alertEmail: true,
            alertPhoneNumber: true,
            globallyDisableEmailAlerts: true,
            globallyDisablePhoneAlerts: true,
            Hosts: {
                select: {
                    id: true,
                },
            },
        },
    });

    res.status(200).json(updatedObject).end();
});

router.get('/:id/hosts', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const userId: number = parseInt(req.params.id);

    if(Number.isNaN(userId)) {
        res.status(400).json({
            status: "error",
            message: "please provide userId",
        });
        return;
    }

    // User can only view his hosts, admin can view everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to view this userId",
        }).end();
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true,
            Hosts: {
                select: {
                    id: true,
                    rhpAddress: true,
                    rhpPubkey: true,
                    extramonPubkey: true,
                },
            },
        },
    });

    if(user === null){
        res.status(404).json({
            status: "error",
            message: "user with id " + userId + " not found",
        });
        return;
    }

    res.status(200).json(user.Hosts).end();
});

router.get('/:id/alerts', async (req: Request, res: Response) => {
    if(!res.locals.authenticated){
        res.status(401).end();
        return;
    }

    const userId: number = parseInt(req.params.id);

    if(Number.isNaN(userId)) {
        res.status(400).json({
            status: "error",
            message: "please provide userId",
        });
        return;
    }

    // User can only view his hosts, admin can view everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        res.status(403).json({
            status: "error",
            message: "you don't have permissions to view this userId",
        }).end();
        return;
    }

    const alerts = await prisma.alert.findMany({
        where: {
            userId: userId,
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
