import { Router, Request, Response } from 'express';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_duplicate_entry } from '../../utils/http_code_helper';

import uptimeRouter from './uptime';

const router = Router();
const prisma = new PrismaClient();

router.use('/:hostId/uptime', uptimeRouter);

router.post('/new', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

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
    if(req.body.userId !== undefined && req.body.userId != request.userId){
        if(!res.locals.auth_user.admin){
            fail_no_permissions(res, "you don't have permissions to create new host for this userId");
            return;
        }
        request.userId = req.body.userId;
    }

    if(request.extramonPubkey === null) request.extramonPubkey = undefined;
    if(request.rhpPubkey === null) request.rhpPubkey = undefined;
    if(request.rhpAddress === null) request.rhpAddress = undefined;

    if(request.extramonPubkey === undefined && (request.rhpAddress === undefined || request.rhpPubkey === undefined)) {
        fail_missing_params(res, ["extramonPubkey", "rhpAddress", "rhpPubkey"], "please provide either pair of rhpAddress AND rhpPubkey; OR extramonPubkey");
        return;
    }

    if(await prisma.host.count({ where: { rhpAddress: request.rhpAddress } }) > 0){
        fail_duplicate_entry(res, "rhpAddress", null);
        return;
    }

    if(await prisma.host.count({ where: { rhpPubkey: request.rhpPubkey } }) > 0){
        fail_duplicate_entry(res, "rhpPubkey", null);
        return;
    }

    if(await prisma.host.count({ where: { rhpPubkey: request.extramonPubkey } }) > 0){
        fail_duplicate_entry(res, "extramonPubkey", null);
        return;
    }

    const host = await prisma.host.create({
        data: request,
    });

	res.status(201).json({
		status: "success",
        data: host,
	});
});

router.get('/:hostId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const hostId = Number.parseInt(req.params.hostId);

    if(!Number.isInteger(hostId)) {
        fail_missing_params(res, ["hostId"], null);
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
        fail_no_permissions(res, "you don't have permissions to view this hostId");
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
        fail_entity_not_found(res, "host with id " + hostId + " not found");
        return;
    }

    res.status(200).json({
        status: "success",
        data: host
    }).end();
});

router.patch('/:hostId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const hostId = Number.parseInt(req.params.hostId);

    if(!Number.isInteger(hostId)) {
        fail_missing_params(res, ["hostId"], null);
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
        fail_no_permissions(res, "you don't have permissions to edit this hostId");
        return;
    }

    const exists = await prisma.host.count({
        where: {
            id: hostId,
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "host with id " + hostId + " not found");
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
        fail_missing_params(res, [], "no body provided");
        return;
    }

    if(updateQuery.rhpAddress !== undefined && updateQuery.rhpAddress !== null && await prisma.host.count({ where: { AND: [{rhpAddress: updateQuery.rhpAddress},{id: {not: hostId}}] } }) > 0){
        fail_duplicate_entry(res, "rhpAddress", null);
        return;
    }

    if(updateQuery.rhpPubkey !== undefined && updateQuery.rhpPubkey !== null && await prisma.host.count({ where: { AND: [{rhpAddress: updateQuery.rhpPubkey},{id: {not: hostId}}] } }) > 0){
        fail_duplicate_entry(res, "rhpPubkey", null);
        return;
    }

    if(updateQuery.extramonPubkey !== undefined && updateQuery.extramonPubkey !== null && await prisma.host.count({ where: { AND: [{rhpAddress: updateQuery.extramonPubkey},{id: {not: hostId}}] } }) > 0){
        fail_duplicate_entry(res, "extramonPubkey", null);
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

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

router.get('/:hostId/alerts', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const hostId = Number.parseInt(req.params.hostId);

    if(!Number.isInteger(hostId)) {
        fail_missing_params(res, ["hostId"], null);
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
        fail_no_permissions(res, "you don't have permissions to view this hostId");
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

    res.status(200).json({
        status: "success",
        data: alerts
    }).end();
});

router.delete('/:hostId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const hostId = Number.parseInt(req.params.hostId);

    if(!Number.isInteger(hostId)) {
        fail_missing_params(res, ["hostId"], null);
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
        fail_no_permissions(res, "you don't have permissions to delete this hostId");
        return;
    }

    await prisma.host.delete({
        where: {
            id: hostId,
        },
    });

    res.status(204).json({
        status: "success",
        data: null,
    }).end();
});

export default router;
