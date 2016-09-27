/* eslint-disable no-undefined */
// disable undefined use for tests
'use strict';

// external modules
var assert = require('chai').assert;
var restifyErrs = require('restify-errors');
var VError = require('verror');

// internal files being tested
var lumberjill = require('../lib');
var stringify = require('../lib/stringify');


describe('lumberjill', function() {

    describe('safe JSON stringify', function() {

        it('should serialize empty object into empty string', function() {
            assert.equal(stringify({}), '');
        });

        it('should replace undefined with "undefined"', function() {
            assert.equal(stringify({
                hello: undefined
            }), '{\n  "hello": "undefined"\n}');
        });

        it('should do no formatting with raw options', function() {
            assert.equal(stringify({
                hello: undefined
            }, true), '{"hello":"undefined"}');
        });

        it('should handle nulls', function() {
            assert.equal(stringify({
                hello: null
            }), '{\n  "hello": null\n}');
        });

        it('should handle circular refs', function() {
            var a = {
                foo: 1
            };
            var b = {
                bar: 2
            };
            a.b = b;
            b.a = a;

            assert.equal(
                stringify(b, true),
                '{"bar":2,"a":{"foo":1,"b":"[Circular ~]"}}'
            );
        });
    });


    describe('should fail to create logger w/ missing options', function() {

        it('should fail without an options object', function() {
            assert.throws(function() {
                lumberjill.create();
            });
        });

        it('should fail without a name', function() {
            assert.throws(function() {
                lumberjill.create({});
            });
        });
    });


    describe('should log stuff', function() {

        var log = lumberjill.create({
            name: 'test'
        });
        var err = new Error('boom!');


        it('should log text', function() {
            assert.doesNotThrow(function() {
                log.info('hi');
            });
        });

        it('should log object and text', function() {
            assert.doesNotThrow(function() {
                log.info({
                    hello: 'world'
                }, 'hi');
            });
        });

        it('should log error and text', function() {
            assert.doesNotThrow(function() {
                log.info(err, 'hi');
            });
        });

        it('should log wrapped VError and text', function() {
            var wrapErr = new VError({
                name: 'SomethingBadHappenedError',
                cause: err,
                info: {
                    foo: 1,
                    bar: 2
                }
            }, 'oh noes!');

            assert.doesNotThrow(function() {
                log.info(wrapErr, 'hi');
            });
        });

        it('should log wrapped restify-error and text', function() {

            restifyErrs.makeConstructor('SomethingBadHappenedError');
            var wrapErr = new restifyErrs.SomethingBadHappenedError(err, {
                message: 'oh noes!',
                context: {
                    foo: 1,
                    bar: 2
                }
            });

            assert.doesNotThrow(function() {
                log.info(wrapErr, 'hi');
            });
        });
    });
});
