const {parentPort, workerData} = require('worker_threads');
const LittleFinger = require(`${__dirname}/index.js`);
const Logger = require(`${__dirname}/logger.js`);
const {LogLevel} = require(`${__dirname}/constants.js`);
const {logLevel, worker_id} = workerData;
const _ = new Logger(logLevel);
LittleFinger.SILENT = false && logLevel === LogLevel.CALM;

function loadSuite(suitePath) {
    LittleFinger.clearIts();
    require(suitePath);
    return {
        path: suitePath,
        tests: LittleFinger._tests,
        beforeAll: undefined,
        beforeEach: undefined,
        afterAll: undefined,
        afterEach: undefined
    }
}

let currentSuite = undefined;
parentPort.on('message', async (message) => {
    const {action, data} = message;
    _.maniac(`Worker-${worker_id}: ` + JSON.stringify(message));
    switch (action) {
        case 'prepare':
            const {suitePath} = data;
            currentSuite = loadSuite(suitePath);
            _.calm(JSON.stringify(currentSuite));
            parentPort.postMessage({
                action: `ready`,
                data: {testsIds: [...currentSuite.tests.keys()], suitePath: currentSuite.path}
            });
            break;
        case 'run':
            if (currentSuite.tests.get(data)) {
                _.calm(`Run ${data} from suite ${currentSuite.parent} on ${`worker-${worker_id}`.bgRed.black}`);
                await LittleFinger.runTest(data, currentSuite.tests.get(data));
                currentSuite.tests.delete(data);
            }
            parentPort.postMessage({
                action: `ready`,
                data: {testsIds: [...currentSuite.tests.keys()], suitePath: currentSuite.path}
            });
            break;
        default:
            parentPort.postMessage(`not supported ${data}`);
    }
});