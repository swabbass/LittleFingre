const {LogLevel} = require(`${__dirname}/constants`);

function initArgParser() {
    var ArgumentParser = require('argparse').ArgumentParser;
    var parser = new ArgumentParser({
        addHelp: true,
        description: 'Little Finger Runner'
    });
    parser.addArgument(
        ['--files'],
        {
            nargs: '+',
            help: 'list of test files'
        }
    );
    parser.addArgument(
        ['--config'],
        {
            help: '.json file as a config file to be injected to the tests suites'
        }
    );
    parser.addArgument(
        ['--parallel'],
        {
            help: 'run tests int parallel',
            action: 'storeTrue'
        }
    );
    parser.addArgument(
        ['--log-level'],
        {
            help: 'sets log level 0 calm, 1 mainiac, otherwise calm',
            type: 'int',
            defaultValue: LogLevel.CALM
        }
    );
    return parser;
}

module.exports = initArgParser().parseArgs();
