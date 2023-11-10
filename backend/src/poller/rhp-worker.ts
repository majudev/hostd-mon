import { Worker, MessagePort, isMainThread, parentPort, workerData } from 'node:worker_threads';
import logger from '../utils/logger';
import {performance} from 'perf_hooks';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PingRequest {
    data: string;
    signature: string;
    pubkey: string;
};

interface PingData {
    timestamp: number;
}

function spawnRHPWorker() : Worker {
    const worker = new Worker(__filename, { workerData: null });
    return worker;
}

async function workerFunction(){
    const dataToHash: string = workerData;

    const startTime = performance.now();

    const satellitesPromise = await prisma.satellite.findMany({
        select: {
            id: true,
            name: true,
            address: true,
        }
    });

    const hostsPromise = prisma.host.findMany({
        select: {
            id: true,
            rhpAddress: true,
            rhpPubkey: true,

            rhpDeadtime: true,
        },
        where: {
            AND: [
                {
                    rhpAddress: {
                        not: null
                    }
                },
                {
                    rhpPubkey: {
                        not: null
                    }
                }
            ]
        }
    });

    const satellites = await satellitesPromise;
    const hosts = await hostsPromise;

    const tlPromise = hosts.map(async (current, index) => {
        const timestamp = new Date();
        const promises = satellites.map(async (satellite) => {
            const response = await fetch('http://' + satellite.address + '/rhp/ping', {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: current.rhpAddress,
                    hostKey: current.rhpPubkey,
                }),
            });

            try {
                if(Math.floor(response.status / 100) == 2){
                    throw 'badcode';
                }

                const body = await response.json();
                await prisma.rHPUptimeEntry.create({
                    data: {
                        hostId: current.id,
                        timestamp: timestamp,

                        ping: body.ping >= 0.0,
                        rhpv2: body.rhpv2,
                        rhpv3: body.rhpv3,

                        satelliteId: satellite.id,

                        deadtime: current.rhpDeadtime,
                    }
                });
            }catch(e){
                await prisma.rHPUptimeEntry.create({
                    data: {
                        hostId: current.id,
                        timestamp: timestamp,

                        ping: false,
                        rhpv2: false,
                        rhpv3: false,

                        satelliteId: satellite.id,

                        deadtime: current.rhpDeadtime,
                    }
                });
            }
        });

        await Promise.all(promises);
    });
    await Promise.all(tlPromise);

    console.debug('Pinged all RHP hosts - took ' + (performance.now() - startTime).toFixed(3) + 'ms');

    (parentPort as MessagePort).postMessage(dataToHash);
}

// If we are inside thread
if (!isMainThread) {
    workerFunction();
}

export default spawnRHPWorker;