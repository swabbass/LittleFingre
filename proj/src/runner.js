#!/usr/bin/env node --experimental-worker

const colors = require('colors');
const {Execution} = require(`${__dirname}/constants`);
const __args = require(`${__dirname}/runner_argparser`);
const Logger = require(`${__dirname}/logger`);
const _ = new Logger(__args.log_level);
//region Globals
global.LilRunner = {
    config: {
        ip: 2480,
    }
};
global.__execution = __args.parallel ? Execution.PARALLEL : Execution.SERIAL;
//endregion

_.maniac(JSON.stringify(__args));

const __cwd = process.cwd();
const __testSuites = __args.files;
const __suitesConfig = __args.config;
const __testSuitePaths = __testSuites.map(s => `${__cwd}/${s}`);
const itsPerSuite = {};


function createWorkerAndWaitForMessages(id, workerData) {
    const path = require('path');
    const {Worker} = require('worker_threads');
    const worker = new Worker(path.resolve(`${__dirname}/suite_worker.js`), {
        workerData: {
            ...workerData,
            worker_id: id
        }
    });
    worker.on('message', (message) => {
        const {action, data} = message;
        _.maniac(`MasterWorker-From-${id}: ${action}`);
        switch (action) {
            case 'ready':
                if (!itsPerSuite[workerData.suitePath]) {
                    _.maniac(`MasterWorker-From-${id} setting its here`);
                    itsPerSuite[workerData.suitePath] = data;
                }
                const itToRun = itsPerSuite[workerData.suitePath].pop();
                if (itToRun) {
                    worker.postMessage({action: 'run', data: itToRun, worker: id});
                } else {
                    _.calm(`Worker-${id} Finished and terminating`.rainbow);
                    worker.terminate()
                }
                break;
            case 'finished':
                break;
        }

    });
    worker.postMessage({action: 'prepare', data: workerData})
}

function runService(workerData) {
    const os = require('os');
    const cpuCount = workerData.execution === Execution.PARALLEL ? os.cpus().length : 1;
    _.calm(`Execution type: ${workerData.execution === Execution.PARALLEL ? "Parallel".rainbow : "Serial".bgCyan.black} Running with ${cpuCount} Workers`);
    for (let i = 0; i < cpuCount; i++) {
        createWorkerAndWaitForMessages(i, {...workerData});
    }
}

const workerData = {'suitePath': __testSuitePaths[0], 'execution': __execution, logLevel: _.logLevel};
runService(workerData);
