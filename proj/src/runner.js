#!/usr/bin/env node --experimental-worker
const path = require('path');

global.LilRunner = {
    config: {
        ip: 2480,
    }
};

global.__execution = 'serial';

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


const __args = parser.parseArgs();
const __cwd = process.cwd();
const __testSuites = __args.files;
const __suitesConfig = __args.config;
const __testSuitePaths = __testSuites.map(s => `${__cwd}/${s}`);
const {Worker} = require('worker_threads');
const itsPerSuite = {};

function createWorkerAndWaitForMessages(id, workerData) {
    const worker = new Worker(path.resolve(`${__dirname}/suite_worker.js`), {workerData});
    worker.on('message', (message) => {
        console.log(`MainREC-${id}: ` + JSON.stringify(message));
        const {action, data} = message;
        switch (action) {
            case 'ready':
                if (!itsPerSuite[workerData.suitePath]) {
                    console.log("setting its here ");
                    itsPerSuite[workerData.suitePath] = data;
                }
                const itToRun = itsPerSuite[workerData.suitePath].pop();
                if (itToRun) {
                    worker.postMessage({action: 'run', data: itToRun, worker: id});
                }
                console.log("finished");
                break;
            case 'finished':
                break;
        }

    });
    worker.postMessage({action: 'prepare', data: workerData})
}

function runService(workerData) {
    for (let i = 0; i < 2; i++) {
        createWorkerAndWaitForMessages(i, workerData);
    }
}


console.log(JSON.stringify(__testSuitePaths));
// console.log(`${__cwd}/${__testSuites[0]}`);
if (__args.parallel) {
    global.__execution = 'parallel';
    console.log('parallel not support');
} else {
    global.__execution = 'serial';
    const workerData = {'suitePath': __testSuitePaths[0], 'execution': __execution};
    runService(workerData)

}
