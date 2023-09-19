import { Router, Request, Response } from 'express';
import logger from '../../../utils/logger';
import { PrismaClient } from '@prisma/client'

const router = Router({
    mergeParams: true
});
const prisma = new PrismaClient();

router.get('/period/:from/:to', async (req: Request, res: Response) => {
    const hostId = Number.parseInt(req.params.hostId);

    if(!Number.isInteger(hostId)) {
        res.status(400).json({
            status: "error",
            message: "please provide hostId",
        });
        return;
    }

    const from: Date = new Date(req.params.from);
    const to: Date = (req.params.to == 'now') ? new Date() : new Date(req.params.to);

    if(req.params.to === undefined || typeof req.params.to !== 'string' || isNaN(from.valueOf()) || req.params.from === undefined || typeof req.params.from !== 'string' || isNaN(to.valueOf())){
        res.status(400).json({
            status: "error",
            message: "please provide valid date range",
        });
        return;
    }

    if(from.getTime() > to.getTime()){
        res.status(400).json({
            status: "error",
            message: "/from/ cannot be later than /to/ date",
        });
        return;
    }

    const hostPromise = prisma.host.findFirst({
        where: {
            id: hostId,
            RHPUptimeEntries: {
                every: {
                    timestamp: {
                        gte: from,
                        lte: to,
                    }
                }
            }
        },
        select: {
            id: true,
            RHPUptimeEntries: {
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
            },
            ExtramonUptimeEntries: {
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
        res.status(404).json({
            status: "error",
            message: "no satellites found",
        });
        await hostPromise;
        return;
    }
    const satellitesArray = satellites.map((satellite) => satellite.name);

    const host = await hostPromise;
    if(host === null){
        res.status(404).json({
            status: "error",
            message: "host with id " + hostId + " not found",
        });
        return;
    }

    const uptimeMap = {
        id: host.id,
        RHPUptimeEntries: new Array(),
        ExtramonUptimeEntries: new Array(),
    };

    const rhpPromise = (async () => {
        const timestampArray = host.RHPUptimeEntries.map((entry) => entry.timestamp);
        const timestampUniqArray = [...new Set(timestampArray)];
        return timestampUniqArray.map(timestamp => {
            const entries = host.RHPUptimeEntries.filter(entry => {
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
        const timestampArray = host.ExtramonUptimeEntries.map((entry) => entry.timestamp);
        const timestampUniqArray = [...new Set(timestampArray)];
        return timestampUniqArray.map(timestamp => {
            const entries = host.ExtramonUptimeEntries.filter(entry => {
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

    uptimeMap.RHPUptimeEntries = await rhpPromise;
    uptimeMap.ExtramonUptimeEntries = await extramonPromise;

    res.status(200).json(uptimeMap).end();
});

export default router;
