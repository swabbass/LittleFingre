class TestsWorker {
    constructor(workerCnt = require('os').cpus().length) {
        const Pool = require("node-workers-pool");
        console.log(`we have ${require('os').cpus().length} cpu cores`);
        this._workersPool = Pool({max: workerCnt});
    }

    enqueue(test, thenCbk, catchCbk) {
        this._workersPool
            .enqueue(test)
            .then(thenCbk)
            .catch(catchCbk)
    }
}


module.exports = TestsWorker;