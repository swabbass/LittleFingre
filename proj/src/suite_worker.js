const {parentPort, workerData} = require('worker_threads');
const LittleFinger = require(`${__dirname}/index.js`);
const Logger = require(`${__dirname}/logger.js`);
const {LogLevel} = require(`${__dirname}/constants.js`);
const {logLevel, worker_id} = workerData;
const _ = new Logger(logLevel);
LittleFinger.SILENT = false && logLevel === LogLevel.CALM;

let currentSuite = undefined;

function loadSuite(suitePath) {
    LittleFinger.clearIts();
    require(suitePath);
    const result = {
        path: suitePath,
        tests: LittleFinger.getTests(),
        beforeAll: undefined,
        beforeEach: undefined,
        afterAll: undefined,
        afterEach: undefined
    };
    return result;
}

parentPort.on('message', async (message) => {
    const {action, data} = message;
    _.maniac(`Worker-${worker_id}: ` + JSON.stringify(message));
    switch (action) {
        case 'prepare':
            const {suitePath} = data;
            currentSuite = loadSuite(suitePath);
            const message1 = {
                action: `ready`,
                data: {testsIds: Object.keys(currentSuite.tests), suitePath: currentSuite.path}
            };
            console.log(message1);
            parentPort.postMessage(message1);
            break;
        case 'run':
            _.calm(`try running ${data} on worker-${worker_id}`);
            if (currentSuite.tests[data]) {
                _.calm(`Run ${data} from suite ${currentSuite.suitePath} on ${`worker-${worker_id}`.bgRed.black}`);
                await LittleFinger.runTest(data, currentSuite.tests[data]);
                delete currentSuite.tests[data];
            }
            parentPort.postMessage({
                action: `ready`,
                data: {testsIds: Object.keys(currentSuite.tests), suitePath: currentSuite.path}
            });
            break;
        default:
            parentPort.postMessage(`not supported ${data}`);
    }
});