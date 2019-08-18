const Pool = require("node-workers-pool");

class TestsWorker {
    constructor(workerCnt = require('os').cpus().length) {
        console.log(`we have ${require('os').cpus().length} cpu cores`);
        this._workersPool = Pool({max: workerCnt});
    }

    enqueue(test, thenCbk, catchCbk, ...args) {
        this._workersPool
            .enqueue(test,args)
            .then(thenCbk)
            .catch(catchCbk)
    }
}


module.exports = TestsWorker;