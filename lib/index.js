'use strict';

// external modules
var assert = require('assert-plus');
var bunyan = require('bunyan');
var _ = require('lodash');
var restifyErrs = require('restify-errors');

// internal files
var stringify = require('./stringify');
var CONSTANTS = require('./constants');


/**
 * a formatted stream so we don't have to force user to send the log
 * back out to bunyan binary again.
 * @class
 * @param {Object} options an options object
 */
function SimpleStream(options) {

    var self = this;

    /**
     * when true, emits logs in raw JSON.
     * @type {Boolean}
     */
    self.raw = options.raw;
}


/**
 * stream's write impl. rolling our own write stream formatter.
 * @method write
 * @param {Object} record a log record
 * @return {undefined}
 */
SimpleStream.prototype.write = function(record) {

    var self = this;

    // log in raw JSON format
    if (self.raw === true) {
        console.warn(stringify(record, true)); // eslint-disable-line no-console
    } else {

        // write to stderr
        var out = [
            '[' + record.name + ']',
            CONSTANTS.COLORS_MAPPING[record.level](
                bunyan.nameFromLevel[record.level]
            ),
            record.msg
        ];

        // first log contextual object
        // clean up the object of bunyan internal fields, clean log it.
        var cleanedObj = _.omit(record, CONSTANTS.BUNYAN_BLACKLIST_FIELDS);

        if (!_.isEmpty(cleanedObj)) {
            out.push(stringify(cleanedObj));
        }

        // then log any errors
        if (record.err) {
            out.push('\n' + record.err.stack);
        }

        console.warn(out.join(' ')); // eslint-disable-line no-console
    }
};


/**
 * creates a bunyan logger using the passed in options.
 * @function create
 * @param {Object} options an option sobject
 * @param {Object} options.name name of the logger
 * @param {Boolean} [options.raw] if true, log in raw JSON
 * @param {Boolean} [options.level] level of the logger. defaults to info/30
 * @return {Object} a bunyan logger
 */
function create(options) {

    assert.object(options, 'options');
    assert.string(options.name, 'options.name');
    assert.optionalBool(options.raw, 'options.raw');
    assert.optionalBool(options.level, 'options.level');

    // backfill default options
    var opts = _.defaults({}, options, {
        level: bunyan.INFO
    });

    return bunyan.createLogger({
        name: opts.name,
        serializers: _.assign({}, bunyan.stdSerializers, {
            err: restifyErrs.bunyanSerializer
        }),
        streams: [
            {
                level: opts.level,
                stream: new SimpleStream(opts),
                type: 'raw'
            }
        ]
    });
}


// re-export bunyan levels for convenience.
module.exports = _.assign({
    create: create
}, _.pick(bunyan, ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']));
