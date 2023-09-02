import spawnExtramonWorker from './extramon-worker';

var extramonWorkerFlag = false;
const extramonWorkerInterval = 60;

function extramonWorkerScheduler(){
    setTimeout(() => {
        extramonWorkerScheduler();
        if(!extramonWorkerFlag){
            console.log('Spawning new ExtramonWorker');

            extramonWorkerFlag = true;
            const worker = spawnExtramonWorker();
            worker.on('message', (result) => {
                extramonWorkerFlag = false;
            });
            worker.on('error', (error) => {
                extramonWorkerFlag = false;
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