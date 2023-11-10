import { Router, Request, Response } from 'express';
import logger from '../../../utils/logger';
import { PrismaClient } from '@prisma/client'
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_internal_error } from '../../../utils/http_code_helper';

const router = Router({
    mergeParams: true
});
const prisma = new PrismaClient();

router.get('/period/:from/:to', async (req: Request, res: Response) => {
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

    const fromNumber = Number.parseInt(req.params.from);
    const toNumber = Number.parseInt(req.params.to);
    const from: Date = new Date(fromNumber);
    const to: Date = (req.params.to == 'now') ? new Date() : new Date(toNumber);

    if(req.params.to === undefined || typeof req.params.to !== 'string' || isNaN(from.valueOf()) || req.params.from === undefined || typeof req.params.from !== 'string' || isNaN(to.valueOf())){
        fail_missing_params(res, ["to", "from"], "please provide valid date range");
        return;
    }

    if(from.getTime() > to.getTime()){
        fail_missing_params(res, ["to", "from"], "/from/ cannot be later than /to/ date");
        return;
    }

    const hostExists = await prisma.host.count({
        where: {
            id: hostId,
        }
    }) > 0;

    if(!hostExists){
        fail_entity_not_found(res, "host with id " + hostId + " not found");
        return;
    }

    const extramonUptimePromise = prisma.extramonUptimeEntry.findMany({
        where: {
            hostId: hostId,
            timestamp: {
                gte: from,
                lte: to,
            }
        },
        select: {
            id: true,
            timestamp: true,
            Satellite: {
                select: {
                    //id: true,
                    name: true,
                }
            },
        },
    });

    const rhpUptimePromise = prisma.rHPUptimeEntry.findMany({
        where: {
            hostId: hostId,
            timestamp: {
                gte: from,
                lte: to,
            }
        },
        select: {
            id: true,
            timestamp: true,
            ping: true,
            rhpv2: true,
            rhpv3: true,
            Satellite: {
                select: {
                    //id: true,
                    name: true,
                }
            },
        },
    });

    const satellitesPromise = prisma.satellite.findMany({
        select: {
            name: true,
        }
    });

    const satellites = await satellitesPromise;
    if(satellites === null){
        fail_internal_error(res, "no satellites found");
        await extramonUptimePromise;
        await rhpUptimePromise;
        return;
    }
    const satellitesArray = satellites.map((satellite) => satellite.name);

    const extramonUptimeEntries = await extramonUptimePromise;
    const rhpUptimeEntries = await rhpUptimePromise;

    const uptimeMap = {
        id: hostId,
        RHPUptimeEntries: new Array(),
        ExtramonUptimeEntries: new Array(),
    };

    const rhpPromise = (async () => {
        const timestampArray = rhpUptimeEntries.map((entry) => entry.timestamp);
        const timestampUniqArray = [...new Set(timestampArray)];
        return timestampUniqArray.map(timestamp => {
            const entries = rhpUptimeEntries.filter(entry => {
                return entry.timestamp.getTime() == timestamp.getTime();
            });
            const satellitesMap = satellitesArray.reduce((previous, current) => {
                return {
                    ...previous,
                    [current]: entries.find(entry => {
                        return entry.Satellite.name === current;
                    }) !== undefined,
                };
            }, {});
            return {
                ...entries[0],
                id: undefined,
                Satellite: undefined,
                satellites: satellitesMap,
            }
        });
    })();

    const extramonPromise = (async () => {
        const timestampArray = extramonUptimeEntries.map((entry) => entry.timestamp);
        //const timestampUniqArray = [...new Set(timestampArray)];
        const timestampSet = new Set(timestampArray);
        const timestampUniqArray = Array.from(timestampSet);
        console.log('timestampUniqArray');
        console.log(timestampUniqArray);
        return timestampUniqArray.map((timestamp, i) => {
            console.log('timestamp: ');
            console.log(timestamp);
            console.log(i)
            const entries = extramonUptimeEntries.filter(entry => {
                return entry.timestamp.getTime() == timestamp.getTime();
            });
            console.log('entries');
            console.log(entries);
            const satellitesMap = satellitesArray.reduce((previous, current) => {
                return {
                    ...previous,
                    [current]: entries.find(entry => {
                        return entry.Satellite.name === current;
                    }) !== undefined,
                };
            }, {});
            console.log('satellitesMap');
            console.log(satellitesMap);
            return {
                timestamp: timestamp,
                satellites: satellitesMap,
            }
        });
    })();

    uptimeMap.RHPUptimeEntries = await rhpPromise;
    uptimeMap.ExtramonUptimeEntries = await extramonPromise;
    console.log(uptimeMap.ExtramonUptimeEntries);

    res.status(200).json({
        status: "success",
        data: uptimeMap
    }).end();
});

export default router;
