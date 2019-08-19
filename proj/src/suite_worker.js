const {parentPort, workerData} = require('worker_threads');
const LittleFinger = require(`${__dirname}/index.js`);
const Logger = require(`${__dirname}/logger.js`);
const {LogLevel} = require(`${__dirname}/constants.js`);
const {logLevel, worker_id} = workerData;
const _ = new Logger(logLevel);
LittleFinger.SILENT = logLevel === LogLevel.CALM;

let currentSuitePath = undefined;
parentPort.on('message', async (message) => {
    const {action, data} = message;
    _.maniac(`Worker-${worker_id}: ` + JSON.stringify(message));
    switch (action) {
        case 'prepare':
            const {suitePath} = data;
            currentSuitePath = suitePath;
            require(currentSuitePath);
            parentPort.postMessage({action: `ready`, data: Object.keys(LittleFinger._its)});
            break;
        case 'run':
            if (LittleFinger._its[data]) {
                _.calm(`Run ${data} from suite ${currentSuitePath} on ${`worker-${worker_id}`.bgRed.black}`);
                await LittleFinger.runTest(data);
            }
            parentPort.postMessage({action: `ready`, data: Object.keys(LittleFinger._its)});
            break;
        default:
            parentPort.postMessage(`not supported ${data}`);
    }
});