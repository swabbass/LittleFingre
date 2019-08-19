const {LogLevel} = require(`${__dirname}/constants.js`);
class Logger {
    constructor(logLevel) {
        this.logLevel = this._calculateLogLevel(logLevel);
    }

    calm(something) {
         console.log(something);
    }

    maniac(something) {
        if (this.logLevel === LogLevel.MAINIAC) {
            this.calm(something)
        }
    }

    _calculateLogLevel(logLevel) {
        switch (logLevel) {
            case LogLevel.CALM:
            case LogLevel.MAINIAC:
                return logLevel;
            default:
                return LogLevel.CALM;
        }
    }
}

module.exports = Logger;