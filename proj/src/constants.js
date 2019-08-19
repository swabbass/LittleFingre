const Execution = {PARALLEL: 1, SERIAL: 0};
const LogLevel = {CALM: 0, MAINIAC: 1};
Object.freeze(Execution);
Object.freeze(LogLevel);

module.exports = {Execution, LogLevel};