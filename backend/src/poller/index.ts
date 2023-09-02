import spawnExtramonWorker from './extramon-worker';
import {performance} from 'perf_hooks';

var extramonWorkerFlag = false;
const extramonWorkerInterval = 60;
var workerSpawned = performance.now();

function extramonWorkerScheduler(){
    setTimeout(() => {
        extramonWorkerScheduler();
        if(!extramonWorkerFlag){
            console.log('Spawning new ExtramonWorker');
            workerSpawned = performance.now();

            extramonWorkerFlag = true;
            const worker = spawnExtramonWorker();
            worker.on('message', (result) => {
                console.log('ExtramonWorker finished it\'s work in ' + (performance.now() - workerSpawned).toFixed(3) + 'ms');
                extramonWorkerFlag = false;
            });
            worker.on('error', (error) => {
                extramonWorkerFlag = false;
                console.log('ExtramonWorker errored out:');
                console.log(error);
            });
        }else{
            console.log('ExtramonWorker hasn\'t finished work yet, not firing...');
        }
    }, extramonWorkerInterval * 1000);
}

export function startScheduler(){
    console.log('Starting ExtramonWorker scheduler (firing every ' + extramonWorkerInterval + ' seconds)');
    extramonWorkerScheduler();
}

export default startScheduler;