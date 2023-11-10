import spawnExtramonWorker from './extramon-worker';
import spawnRHPWorker from './rhp-worker';
import spawnExtramonNotifier from './extramon-notifier';
import spawnRHPNotifier from './rhp-notifier';
import logger from '../utils/logger';
import {performance} from 'perf_hooks';

var extramonWorkerFlag = false;
const extramonWorkerInterval = 60;
var extramonWorkerSpawned = performance.now();

var rhpWorkerFlag = false;
const rhpWorkerInterval = 60;
var rhpWorkerSpawned = performance.now();

var extramonNotifierFlag = false;
const extramonNotifierInterval = 180;
var extramonNotifierSpawned = performance.now();

var rhpNotifierFlag = false;
const rhpNotifierInterval = 180;
var rhpNotifierSpawned = performance.now();

function extramonWorkerScheduler(additionalTimeout: number = 0){
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
    }, extramonWorkerInterval * 1000 + additionalTimeout);
}

function rhpWorkerScheduler(additionalTimeout: number = 0){
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
    }, rhpWorkerInterval * 1000 + additionalTimeout);
}

function extramonNotifierScheduler(additionalTimeout: number = 0){
    setTimeout(() => {
        extramonNotifierScheduler();
        if(!extramonNotifierFlag){
            logger.info('Spawning new ExtramonNotifier');
            extramonNotifierSpawned = performance.now();

            extramonNotifierFlag = true;
            const worker = spawnExtramonNotifier();
            worker.on('message', (result) => {
                logger.info('ExtramonNotifier finished it\'s work in ' + (performance.now() - extramonNotifierSpawned).toFixed(3) + 'ms');
                extramonNotifierFlag = false;
            });
            worker.on('error', (error) => {
                extramonNotifierFlag = false;
                logger.error('ExtramonNotifier errored out:');
                console.log(error);
            });
        }else{
            logger.info('ExtramonNotifier hasn\'t finished work yet, not firing...');
        }
    }, extramonNotifierInterval * 1000 + additionalTimeout);
}

function rhpNotifierScheduler(additionalTimeout: number = 0){
    setTimeout(() => {
        rhpNotifierScheduler();
        if(!rhpNotifierFlag){
            logger.info('Spawning new RHPNotifier');
            rhpNotifierSpawned = performance.now();

            rhpNotifierFlag = true;
            const worker = spawnRHPNotifier();
            worker.on('message', (result) => {
                logger.info('RHPNotifier finished it\'s work in ' + (performance.now() - rhpNotifierSpawned).toFixed(3) + 'ms');
                rhpNotifierFlag = false;
            });
            worker.on('error', (error) => {
                rhpNotifierFlag = false;
                logger.error('RHPNotifier errored out:');
                console.log(error);
            });
        }else{
            logger.info('RHPNotifier hasn\'t finished work yet, not firing...');
        }
    }, rhpNotifierInterval * 1000 + additionalTimeout);
}

export function startScheduler(){
    logger.info('Starting ExtramonWorker scheduler (firing every ' + extramonWorkerInterval + ' seconds)');
    extramonWorkerScheduler(Math.floor(Math.random() * extramonWorkerInterval/2 * 1000));

    logger.info('Starting RHPWorker scheduler (firing every ' + rhpWorkerInterval + ' seconds)');
    rhpWorkerScheduler(Math.floor(Math.random() * rhpWorkerInterval/2 * 1000));

    logger.info('Starting ExtramonNotifier scheduler (firing every ' + extramonNotifierInterval + ' seconds)');
    extramonNotifierScheduler(Math.floor(Math.random() * 10000));

    logger.info('Starting RHPNotifier scheduler (firing every ' + rhpNotifierInterval + ' seconds)');
    rhpNotifierScheduler(Math.floor(Math.random() * 10000));
}

export default startScheduler;