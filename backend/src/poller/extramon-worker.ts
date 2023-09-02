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

function spawnExtramonWorker() : Worker {
    const worker = new Worker(__filename, { workerData: null });
    return worker;
}

async function workerFunction(){
    const dataToHash: string = workerData;

    const startTime = performance.now();

    const satellites = await prisma.satellite.findMany({
        select: {
            name: true,
            address: true,
        }
    });

    const afterSatellitesFound = performance.now();

    const responseArray: Record<string, string[]> = await satellites.reduce(async (previous, current) => {
        const response = await fetch('http://' + current.address + '/extramon/master/cache');
        const status = response.status;

        if(Math.floor(status / 100) != 2){
            logger.warn('Cannot contact satellite ' + current.name + ' (http://' + current.address + ') - status code ' + response.status);
            return await previous;
        }

        const body = await response.json();

        if(!Array.isArray(body)){
            logger.error('Bad JSON returned by satellite ' + current.name + ' (http://' + current.address + ')');
            return await previous;
        }

        body.sort();
        return {
            ...await previous,
            [current.address]: body,
        };
    }, {});

    const afterSatellitesQueried = performance.now();

    var combinedKeyArray: string[] = [];
    for(const satellite in responseArray){
        combinedKeyArray = [
            ...combinedKeyArray,
            ...responseArray[satellite],
        ];
    }

    /*const filteredKeyArray = combinedKeyArray.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
    }).sort();*/
    const filteredKeyArray = [...new Set(combinedKeyArray)].sort();

    const afterArrayPrepared = performance.now();

    var cacheLists: Record<string, Record<string, string[]>> = {};
    for(const satellite in responseArray){
        cacheLists = {
            ...cacheLists,
            [satellite]: {
                get: [],
                delete: [],
            }
        };
    }
    filteredKeyArray.forEach((key) => {
        var availability: string[] = [];
        for(const satellite in responseArray){
            if(responseArray[satellite].includes(key)){
                availability = [
                    ...availability,
                    satellite,
                ];
            }
        }
        
        const randomIndex = Math.round(Math.random() * (availability.length - 1));
        for(var i = 0; i < availability.length; ++i){
            if(i == randomIndex){
                cacheLists[availability[i]].get.push(key);
            }else{
                cacheLists[availability[i]].delete.push(key);
            }
        }
    });

    const afterCacheListsPrepared = performance.now();

    for(const satellite in cacheLists){
        const postData = cacheLists[satellite];

        const response = await fetch('http://' + satellite + '/extramon/master/cache-update',{
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        });
        const status = response.status;
        if(Math.floor(status / 100) != 2){
            logger.error('Cannot push cache update to satellite ' + satellite);
            break;
        }
        const body = await response.json();

        for(const key in body){
            if(key.startsWith('ping.')){
                const request: PingRequest = body[key];
                if(request.data === undefined || request.signature === undefined || request.pubkey === undefined){
                    logger.warn("Malformed value of key " + key + ", discarding");
                    continue;
                }
                const data: PingData = JSON.parse(request.data);
                
                const hostId = await prisma.host.findFirst({
                    where: {
                        extramonPubkey: request.pubkey,
                    },
                    select: {
                        id: true,
                    }
                });

                if(hostId === null){
                    logger.warn("No host associated with pubkey, discarding");
                    continue;
                }

                for(const innerSatellite in cacheLists){
                    if(!cacheLists[innerSatellite].get.includes(key)) continue;

                    const satelliteId = await prisma.satellite.findFirst({
                        where: {
                            address: innerSatellite,
                        },
                        select: {
                            id: true,
                        }
                    });

                    if(satelliteId === null){
                        logger.error("Internal error, satellite with this address not found. Discarding.");
                        continue;
                    }

                    await prisma.extramonUptimeEntry.create({
                        data: {
                            timestamp: new Date(data.timestamp * 1000),
                            satelliteId: satelliteId.id,
                            hostId: hostId.id,
                        }
                    });
                }
            }else{
                logger.warn('Discarding unknown key ' + key);
            }
        }
    }

    const afterCacheListsCommited = performance.now();

    console.debug('Pulled cache - took ' + (afterCacheListsCommited - startTime).toFixed(3) + 'ms, including:');
    console.debug('- ' + (afterSatellitesFound-startTime).toFixed(3) + 'ms to retrieve satellites from DB');
    console.debug('- ' + (afterSatellitesQueried-afterSatellitesFound).toFixed(3) + 'ms to retrieve available cache keys from satellites');
    console.debug('- ' + (afterArrayPrepared-afterSatellitesQueried).toFixed(3) + 'ms to sort and remove duplicates from list');
    console.debug('- ' + (afterCacheListsPrepared-afterArrayPrepared).toFixed(3) + 'ms to transform list into cacheList query');
    console.debug('- ' + (afterCacheListsCommited-afterCacheListsPrepared).toFixed(3) + 'ms to commit changes into local DB');

    (parentPort as MessagePort).postMessage(dataToHash);
}

// If we are inside thread
if (!isMainThread) {
    workerFunction();
}

export default spawnExtramonWorker;