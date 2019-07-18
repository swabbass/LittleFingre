#!/usr/bin/env node --experimental-worker
const TestsWorker = require('./workers');
const self = require('./index');
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
console.log(JSON.stringify(__testSuitePaths));
// console.log(`${__cwd}/${__testSuites[0]}`);
if (__args.parallel) {
    const testWorker = new TestsWorker();
    global.__execution = 'parallel';
    console.log('parallel not support');
} else {
    const testWorker = new TestsWorker(1);
    global.__execution = 'serial';
    __testSuitePaths.forEach((suite) => require(suite));
    testWorker.enqueue(self.end, result => console.log(`worker finished: ${result}`), err => console.error(err))
    // require(__testSuitePaths[0]);
}
