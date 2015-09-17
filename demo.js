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


const iopa = require('iopa'),
     iopaStream = require('iopa-common-stream'),
     stubServer = require('iopa-test').stubServer
   
const  constants = iopa.constants,
  IOPA = constants.IOPA,
  SERVER = constants.SERVER

const iopaMessageLogger = require('./index.js').MessageLogger

var app = new iopa.App();

app.use(iopaMessageLogger);

var seq = 0;
app.use(function (context, next) {
  context.response[SERVER.RawStream].end("HELLO WORLD " + seq++);
  return next();
});

var server = stubServer.createServer(app.build())
server.connectuse(iopaMessageLogger);

server.receive("TEST");
server.connect("urn://localhost").then(function(client){
    return client.fetch("/projector", "GET", function(context){
          context[SERVER.RawStream].end("HELLO WORLD " + seq++);
       });
})