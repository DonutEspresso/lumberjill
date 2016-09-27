'use strict';

var chalk = require('chalk');


module.exports = {
    BUNYAN_BLACKLIST_FIELDS: [
        'name',
        'hostname',
        'pid',
        'level',
        'msg',
        'name',
        'time',
        'v',
        'err'
    ],
    COLORS_MAPPING: {
        60: chalk.red,      // fatal
        50: chalk.red,      // error
        40: chalk.yellow,   // warn
        30: chalk.cyan,     // info
        20: chalk.magenta,  // debug
        10: chalk.blue      // trace
    }
};
