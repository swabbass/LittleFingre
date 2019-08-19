#!/usr/bin/env node --experimental-worker
const colors = require('colors');

global.LilRunner = {
    config: {
        ip: 2480,
    }
};

global.__execution = 'serial';

function initArgParser() {
    var ArgumentParser = require('argparse').ArgumentParser;
    var parser = new ArgumentParser({
        addHelp: true,
        description: 'Little Finger Runner'
    });
    parser.addArgument(
        ['--files'],
        {
            nargs: '+',
            help: 'list of test files'
        }
    );
    parser.addArgument(
        ['--config'],
        {
            help: '.json file as a config file to be injected to the tests suites'
        }
    );
    parser.addArgument(
        ['--parallel'],
        {
            help: 'run tests int parallel',
            action: 'storeTrue'
        }
    );
    return parser;
}

var parser = initArgParser();

const __args = parser.parseArgs();
const __cwd = process.cwd();
const __testSuites = __args.files;
const __suitesConfig = __args.config;
const __testSuitePaths = __testSuites.map(s => `${__cwd}/${s}`);
const itsPerSuite = {};


function createWorkerAndWaitForMessages(id, workerData) {
    const path = require('path');
    const {Worker} = require('worker_threads');
    const worker = new Worker(path.resolve(`${__dirname}/suite_worker.js`), {workerData});
    worker.on('message', (message) => {
        const {action, data} = message;
        console.log(`MainREC-${id}: ${action}`);

        switch (action) {
            case 'ready':
                if (!itsPerSuite[workerData.suitePath]) {
                    console.log("setting its here ");
                    itsPerSuite[workerData.suitePath] = data;
                }
                const itToRun = itsPerSuite[workerData.suitePath].pop();
                if (itToRun) {
                    worker.postMessage({action: 'run', data: itToRun, worker: id});
                } else {
                    console.log(`Worker-${id} Finished and waiting`.rainbow);
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
    const cpuCount = os.cpus().length;
    console.log(`Running with ${cpuCount} Workers`.bgMagenta.black);
    for (let i = 0; i < cpuCount; i++) {
        createWorkerAndWaitForMessages(i, workerData);
    }
}


console.log(JSON.stringify(__testSuitePaths));
if (__args.parallel) {
    global.__execution = 'parallel';
    console.log('parallel not support');
} else {
    global.__execution = 'serial';
    const workerData = {'suitePath': __testSuitePaths[0], 'execution': __execution};
    runService(workerData)

}
