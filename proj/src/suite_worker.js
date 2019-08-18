const {parentPort} = require('worker_threads');

parentPort.on('message', (message) => {
    const {type, data} = message;
    console.log("REC: " + JSON.stringify(message));
    switch (type) {
        case 'init':
            parentPort.postMessage({type: `ack_${type}`, data: data});
            break;
        default:
            parentPort.postMessage(`not supported`);
    }
});