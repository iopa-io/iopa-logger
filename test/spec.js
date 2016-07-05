/*
 * Copyright (c) 2015 Internet of Protocols Alliance (IOPA)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const iopa = require('iopa');
require('iopa-rest');

const iopaMiddleware = require('../index.js'),
    iopaMessageLogger = require('../index.js').MessageLogger,
    stubServer = require('iopa-test').stubServer

const should = require('should');


describe('#MessageLogger()', function () {
    var count = 0, seq = 0;
    const log = {
        info: function (data) {
            console.info(data);
            count++;
        },
        error: function (data) { console.error(data); count = -100; },
        warn: function (data) { console.warn(data); count = -200; }
    }

    it('should have MessageLogger', function () {
        iopaMiddleware.should.have.property("MessageLogger");
    });

    it('should log outgoing messages', function (done) {

        var app = new iopa.App({ "server.Logger": log });
        app.use(stubServer);
        app.use(stubServer.continue);
        app.use(iopaMessageLogger);

        app.use(function (context, next) {
            context.response[IOPA.Body].end("HELLO WORLD " + seq++);
            return next();
        });

        var server = app.createServer("stub:");

        server.connect("urn://localhost").then(function (client) {
            var context = client.create("/projector", "GET");
            client["iopa.Events"].on("response", function (response) {
                var responseBody = response["iopa.Body"].toString();
                seq.should.equal(2);
                done();
            })

            context["iopa.Body"].end("HELLO WORLD " + seq++);
        });

    })

    it('should log incoming messages', function (done) {

        var app = new iopa.App({ "server.Logger": log });
       app.use(stubServer);
        app.use(stubServer.continue);
       
        app.use(iopaMessageLogger);

        app.use(function (context, next) {
            context.response[IOPA.Body].end("HELLO WORLD " + seq++);
            return next();
        });

        
         var server = app.createServer("stub:");

        server.connect("urn://localhost").then(function (client) {
            var context = client.create("/projector", "GET");
            client["iopa.Events"].on("response", function (response) {
                var responseBody = response["iopa.Body"].toString();
                seq.should.equal(4);
                done();
            })

            context["iopa.Body"].end("HELLO WORLD " + seq++);
        });

    })
});
