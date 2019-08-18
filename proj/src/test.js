function runService(workerData) {
    const worker = new Worker(path.resolve('suite_worker.js'), {workerData});
    worker.on('message', function (msg) {
        console.log("message from worker: " + JSON.stringify(msg));
    });
}

runService({'hee':"hello"});