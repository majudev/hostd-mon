import spawnExtramonWorker from './extramon-worker';
import logger from '../utils/logger';
import {performance} from 'perf_hooks';

var extramonWorkerFlag = false;
const extramonWorkerInterval = 60;
var workerSpawned = performance.now();

function extramonWorkerScheduler(){
    setTimeout(() => {
        extramonWorkerScheduler();
        if(!extramonWorkerFlag){
            logger.info('Spawning new ExtramonWorker');
            workerSpawned = performance.now();

            extramonWorkerFlag = true;
            const worker = spawnExtramonWorker();
            worker.on('message', (result) => {
                logger.info('ExtramonWorker finished it\'s work in ' + (performance.now() - workerSpawned).toFixed(3) + 'ms');
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

export function startScheduler(){
    logger.info('Starting ExtramonWorker scheduler (firing every ' + extramonWorkerInterval + ' seconds)');
    extramonWorkerScheduler();
}

export default startScheduler;