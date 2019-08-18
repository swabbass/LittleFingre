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

function runService(workerData) {

    const worker = new Worker(path.resolve(`${__dirname}/suite_worker.js`), {workerData});
    worker.on('message', (message) => {
        console.log("MainREC: " + JSON.stringify(message));
        const {type, data} = message;
        switch (type) {
            case 'ack_init':
                worker.postMessage({type: 'data', data: {fileName: 'filenameeee', data}});
                break;
            default:
                console.log('message type not supported');
        }

    });
    worker.postMessage({type: 'init', data: workerData})

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
