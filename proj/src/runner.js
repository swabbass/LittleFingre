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
const testIdsPerSuite = {};
const workers = [];
const workersData = {
    suites: __testSuitePaths,
    'execution': __execution,
    logLevel: _.logLevel
};

function findRunningTestWithTheMostTests() {
    const map = new Map(testIdsPerSuite);
    const sizesArray = [...map.entries()].map(([key, value]) => [key, value.length]);
    return sizesArray.reduce(function (p, v) {
        return (p[1] > v[1] ? p : v);
    })[0];
}

function findNextSuiteToRun() {
    const runningSuitesCnt = Object.keys(testIdsPerSuite).length;
    const suitesCnt = workersData.suites.length;

    //no suites waiting or running to share then just finish
    if (suitesCnt === 0) {
        if (runningSuitesCnt === 0) {
            return undefined;
        } else {
            return findRunningTestWithTheMostTests();
        }
    } else {
        if (runningSuitesCnt === 0) {
            return workersData.suites.pop();
        } else {
            //simple heuristic condition (
            if (suitesCnt >= runningSuitesCnt) {
                //maybe its better to use one of waiting suites
                return workersData.suites.pop();
            } else {
                //Simple way for now is just to take the running task with max number of tests remaining to share (not accurate and not good) but simple stupid
                return findRunningTestWithTheMostTests();
            }
        }
    }
}

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
        _.maniac(`MasterWorker-From-${id}: ${JSON.stringify(message)}`);
        switch (action) {
            case 'ready':
                if (!testIdsPerSuite[data.suitePath]) {
                    _.calm(`MasterWorker-From-${id} tests for suite ${data.suitePath} ${'added'.bgBlue.black}`);
                    testIdsPerSuite[data.suitePath] = data.testsIds;
                }
                _.calm(testIdsPerSuite);
                const testIdToRun = testIdsPerSuite[data.suitePath].pop();
                _.calm(`trying to run test ${testIdToRun} on worker-${id}`);
                if (testIdToRun) {
                    worker.postMessage({action: 'run', data: testIdToRun, worker: id});
                } else {
                    delete testIdsPerSuite[data.suitePath];
                    const suitePathToRun = findNextSuiteToRun();
                    if (suitePathToRun === undefined) {      
                        _.calm(`Worker-${id} Finished and terminating`.rainbow);
                        worker.terminate()
                    } else {
                        worker.postMessage({action: 'prepare', data: {suitePath: suitePathToRun}})
                    }

                }
                break;
            case 'finished':
                break;
        }

    });
    return worker;
}

function runService(workersData) {
    const os = require('os');
    const cpuCount = workersData.execution === Execution.PARALLEL ? os.cpus().length : 1;
    _.calm(`Execution type: ${workersData.execution === Execution.PARALLEL ? "Parallel".rainbow : "Serial".bgCyan.black} Running with ${cpuCount} Workers`);
    for (let i = 0; i < cpuCount; i++) {
        workers[i] = createWorkerAndWaitForMessages(i, {...workersData});
    }
    if (workersData.suites.length < cpuCount) {
        /// just beat it
    }
    for (let i = 0; i < workers.length; i++) {
        const suitePath = workersData.suites.pop();
        if (suitePath) {
            workers[i].postMessage({action: 'prepare', data: {suitePath}})
        }
    }
}


runService(workersData);
