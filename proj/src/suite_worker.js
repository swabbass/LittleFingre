const {parentPort} = require('worker_threads');
const LittleFinger = require(`${__dirname}/index.js`);
let currentSuitePath = undefined;
parentPort.on('message', async (message) => {
    const {action, data} = message;
    console.log("REC: " + JSON.stringify(message));
    switch (action) {
        case 'prepare':
            const {suitePath} = data;
            currentSuitePath = suitePath;
            require(currentSuitePath);
            parentPort.postMessage({action: `ready`, data: Object.keys(LittleFinger._its)});
            break;
        case 'run':
            if (LittleFinger._its[data]) {
                await LittleFinger.runTest(data);
            }
            parentPort.postMessage({action: `ready`, data: Object.keys(LittleFinger._its)});
            break;
        default:
            parentPort.postMessage(`not supported ${data}`);
    }
});