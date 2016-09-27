'use strict';

// external modules
var safeStringify = require('json-stringify-safe');
var _ = require('lodash');


/**
 * convenience function for calling JSON.stringify. uses replacer function
 * to replace undefineds with "undefined", and also handles empty/null obj
 * @function stringify
 * @param {Object} obj an object to stringify
 * @param {Boolean} raw when true, log raw so no JSON formatting needed
 * @return {String}
 */
function stringify(obj, raw) {

    if (!obj || _.isEmpty(obj)) {
        return '';
    } else {
        return safeStringify(obj, function replacer(key, val) {
            // JSON cannot have undefined values.
            // convert to string 'undefined' so they don't get stripped.
            return (typeof val === 'undefined') ?
                'undefined' : val;
        }, (raw === true) ? '' : 2);
    }
}


module.exports = stringify;
