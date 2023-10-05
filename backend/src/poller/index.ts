import spawnExtramonWorker from './extramon-worker';
import spawnRHPWorker from './rhp-worker';
import logger from '../utils/logger';
import {performance} from 'perf_hooks';

var extramonWorkerFlag = false;
const extramonWorkerInterval = 60;
var extramonWorkerSpawned = performance.now();

var rhpWorkerFlag = false;
const rhpWorkerInterval = 60;
var rhpWorkerSpawned = performance.now();

function extramonWorkerScheduler(){
    setTimeout(() => {
        extramonWorkerScheduler();
        if(!extramonWorkerFlag){
            logger.info('Spawning new ExtramonWorker');
            extramonWorkerSpawned = performance.now();

            extramonWorkerFlag = true;
            const worker = spawnExtramonWorker();
            worker.on('message', (result) => {
                logger.info('ExtramonWorker finished it\'s work in ' + (performance.now() - extramonWorkerSpawned).toFixed(3) + 'ms');
                extramonWorkerFlag = false;
            });
            worker.on('error', (error) => {
                extramonWorkerFlag = false;
                logger.error('ExtramonWorker errored out:');
                console.log(error);
            });
        }else{
            logger.info('ExtramonWorker hasn\'t finished work yet, not firing...');
        }
    }, extramonWorkerInterval * 1000);
}

function rhpWorkerScheduler(){
    setTimeout(() => {
        rhpWorkerScheduler();
        if(!rhpWorkerFlag){
            logger.info('Spawning new RHPWorker');
            rhpWorkerSpawned = performance.now();

            rhpWorkerFlag = true;
            const worker = spawnRHPWorker();
            worker.on('message', (result) => {
                logger.info('RHPWorker finished it\'s work in ' + (performance.now() - rhpWorkerSpawned).toFixed(3) + 'ms');
                rhpWorkerFlag = false;
            });
            worker.on('error', (error) => {
                rhpWorkerFlag = false;
                logger.error('RHPWorker errored out:');
                console.log(error);
            });
        }else{
            logger.info('RHPWorker hasn\'t finished work yet, not firing...');
        }
    }, rhpWorkerInterval * 1000);
}

export function startScheduler(){
    logger.info('Starting ExtramonWorker scheduler (firing every ' + extramonWorkerInterval + ' seconds)');
    extramonWorkerScheduler();

    logger.info('Starting RHPWorker scheduler (firing every ' + rhpWorkerInterval + ' seconds)');
    rhpWorkerScheduler();
}

export default startScheduler;