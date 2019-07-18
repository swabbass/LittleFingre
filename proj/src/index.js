const colors = require('colors');

const {indent, indentLines, repeat} = require('./utils');

const littleFinger = {
    SILENT: false
};

const log = (str) => !littleFinger.SILENT && console.log(str);

let indentLevel = 0;


const _its = [];

const summary = {success: 0, fail: 0, disabled: 0};

const expect = (expression) => {
    if (expression) {
        return true
    } else {
        throw new Error('Assertion Failed')
    }
};

function _performIt(desc, callback) {
    try {
        callback();
        log(`${indent(indentLevel + 1)}${' OK '.bgGreen.black} ${desc.green}`);
        summary.success++;
    } catch (e) {
        log(`${indent(indentLevel + 1)}${' FAIL '.bgRed.black} ${desc.red}`);
        log(indentLines(e.stack.red, indentLevel + 2));
        summary.fail++;
    }
}

const it = (desc, callback) => {
    log(`${"ADDED".bgYellow.black} ${desc}`);
    _its.push({desc, callback});
};

const xit = (desc, callback) => {
    log(`${'DISABLED'.bgWhite.black} ${desc}`);
    summary.disabled++;
};

var suits;

const describe = (suiteName, testCallback, options) => {
    log(`Running suite:${suiteName}`);
    suits[suiteName] = testCallback;
};

function runTests(execution) {
    if (execution === 'serial') {
        console.log('\n');
        console.log("Running tests in serial...");
        console.log('\n');
        _its.forEach(({desc, callback}) => _performIt(desc, callback));
    } else {
        console.error("running tests in parallel not supported");
    }
}

const end = () => {
    runTests(__execution);
    log(`\n${repeat('.', 60)}\n`);
    log('Test summary:\n');
    log(`  Success: ${summary.success}`.green);
    log(`  Fail: ${summary.fail}`.red);
    log(`  Disabled: ${summary.disabled}\n\n`.gray);
    if (summary.fail > 0) process.exit(1);
    process.exit(0);
};


const dsl = {expect, it, xit, describe, end/*,group, beforeEach, beforeAll*/};

module.exports = Object.assign(littleFinger, dsl);