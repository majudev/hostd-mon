import { Worker, MessagePort, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

function spawnExtramonWorker() : Worker {
    const worker = new Worker(__filename, { workerData: null });
    
    worker.on('message', (result) => {
        console.log('SHA-256 Hash:', result);
    });
    worker.on('error', (error) => {
        console.error('Worker error:', error);
    });

    return worker;
}

async function workerFunction(){
    const dataToHash: string = workerData;

    const satellites = await prisma.satellite.findMany({
        select: {
            name: true,
            address: true,
        }
    });

    const responseArray: Record<string, string[]> = await satellites.reduce(async (previous, current) => {
        const response = await fetch('http://' + current.address + '/extramon/master/cache');
        const status = response.status;
        const body = await response.json();

        if(!Array.isArray(body)) return await previous;

        body.sort();
        return {
            ...await previous,
            [current.address]: body,
        };
    }, {});

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
            console.log('Cannot push cache update to satellite ' + satellite);
            break;
        }
        const body = await response.json();

        //TODO
    }

    (parentPort as MessagePort).postMessage(dataToHash);
}

// If we are inside thread
if (!isMainThread) {
    workerFunction();
}

export default spawnExtramonWorker;