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

const iopaMiddleware = require('../index.js'),
    iopaMessageLogger = require('../index.js').MessageLogger,
    stubServer = require('iopa-test').stubServer

const should = require('should');

const iopa = require('iopa');

describe('#MessageLogger()', function () {
    var count = 0, seq=0;
    const log = {
        info: function(data){
            console.info( data);
            count ++;
             },
        error: function(data){console.error(data); count = -100; },
        warn: function(data){console.warn( data); count = -200; }
    }
   
    it('should have MessageLogger', function () {
        iopaMiddleware.should.have.property("MessageLogger");
    });

    it('should log outgoing messages', function (done) {

        var app = new iopa.App({"server.Logger": log});

        app.use(iopaMessageLogger);

       app.use(function (context, next) {
            context.response["server.RawStream"].end("HELLO WORLD " + seq++);
            return next();
        });

        var server = stubServer.createServer(app.build())
    
        server.receive("TEST");
         process.nextTick(function(){
                count.should.equal(2);
                done();
            });

    })
    
     it('should log incoming messages', function (done) {

        var app = new iopa.App({"server.Logger": log});

        app.use(iopaMessageLogger);

        app.use(function (context, next) {
            context.response["server.RawStream"].end("HELLO WORLD " + seq++);
            return next();
        });

        var server = stubServer.createServer(app.build())
      
         server.connect("urn://localhost").then(function (client) {
            return client.fetch("/projector", "GET", function (context) {
                context["server.RawStream"].end("HELLO WORLD " + seq++);
            });
        }).then(function(){
            process.nextTick(function(){
                count.should.equal(4);
                done();
            });
        })


    })
});
