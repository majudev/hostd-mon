import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found } from '../../utils/http_code_helper';

const router = Router();
const prisma = new PrismaClient();

router.get('/:id', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(req.params.id === 'all'){
        if(!res.locals.auth_user.admin){
            fail_no_permissions(res, "you don't have permissions to obtain userlist");
            return;
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                admin: true,
            },
        });

        res.status(200).json({
            status: "success",
            data: users
        }).end();
        return;
    }

    var userId: number = parseInt(req.params.id === 'me' ? res.locals.auth_user.userId : req.params.id);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    // User can only view his hosts, admin can view everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        fail_no_permissions(res, "you don't have permissions to view this userId");
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
        fail_entity_not_found(res, "user with id " + userId + " not found");
        return;
    }

    res.status(200).json({
        status: "success",
        data: user
    }).end();
});

router.patch('/:userId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId: number = parseInt(req.params.userId);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    // User can only edit himself, admin can edit everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        fail_no_permissions(res, "you don't have permissions to edit this userId");
        return;
    }

    const exists = await prisma.user.count({
        where: {
            id: userId,
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "user with id " + userId + " not found");
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
        fail_missing_params(res, [], "no body provided");
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

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

router.get('/:id/hosts', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId: number = parseInt(req.params.id);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    // User can only view his hosts, admin can view everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        fail_no_permissions(res, "you don't have permissions to view this userId");
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
        fail_entity_not_found(res, "user with id " + userId + " not found");
        return;
    }

    res.status(200).json({
        status: "success",
        data: user.Hosts
    }).end();
});

router.get('/:id/alerts', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId: number = parseInt(req.params.id);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    // User can only view his hosts, admin can view everything
    if(userId != res.locals.auth_user.userId && !res.locals.auth_user.admin){
        fail_no_permissions(res, "you don't have permissions to view this userId");
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
            read: true,
            Host: {
                select: {
                    id: true,
                    name: true,
                }
            }
        },
    });

    res.status(200).json({
        status: "success",
        data: alerts
    }).end();
});

export default router;
