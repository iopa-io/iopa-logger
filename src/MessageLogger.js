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

const util = require('util'),
    iopaStream = require('iopa-common-stream');
    
const constants = require('iopa').constants,
    IOPA = constants.IOPA,
    SERVER = constants.SERVER
  
     
const MESSAGE_LOGGER = {
     CAPABILITY: "urn:io.iopa:MessageLogger",
     HOOKED: "messageLogger.Hooked"
     }
 
 const packageVersion = require('../package.json').version;

/**
 * IOPA Middleware 
 *
 * @class MessageLogger
 * @this app.properties  the IOPA AppBuilder Properties Dictionary, used to add server.capabilities
 * @constructor
 * @public
 */
function MessageLogger(app) {
     app.properties[SERVER.Capabilities][MESSAGE_LOGGER.CAPABILITY] = {};
     app.properties[SERVER.Capabilities][MESSAGE_LOGGER.CAPABILITY][SERVER.Version] = packageVersion;
}

/**
 * @method invoke
 * @param context IOPA context dictionary
 * @param next   IOPA application delegate for the remainder of the pipeline
 */
MessageLogger.prototype.invoke = function MessageLogger_invoke(context, next) {
    
    // HOOK INTO TO CHANNEL CONTEXT
    if (context[SERVER.ParentContext] 
    && !context[SERVER.ParentContext][SERVER.Capabilities][MESSAGE_LOGGER.CAPABILITY][MESSAGE_LOGGER.HOOKED])
       this.invoke.call(this, context[SERVER.ParentContext], false); 
    
    context[SERVER.Capabilities][MESSAGE_LOGGER.CAPABILITY][MESSAGE_LOGGER.HOOKED]=true;
      
    // HOOK INTO CLIENT FETCHES
    if (context[SERVER.Fetch]) 
       context[SERVER.Fetch] = _fetch.bind(this, context, context[SERVER.Fetch]);
      
     if (next)
    {
        // NOT CALLED FROM CHILD CONTEXT INVOKE
         
        // HOOK INTO RESPONSE STREAM
        context.response[SERVER.RawStream] = new iopaStream.OutgoingStreamTransform(_writeResponse.bind(this, context.response, context.response[SERVER.RawStream]));
        context.log.info("[IOPA] REQUEST IN " + _requestLog(context))
        return next();
    }
};

/**
 * @method connect
 * @this context IOPA context dictionary
 */
MessageLogger.prototype.connect = function MessageLogger_connect(context) {
         
    // HOOK INTO CLIENT FETCHES
    if (context[SERVER.Fetch]) 
       context[SERVER.Fetch] = _fetch.bind(this, context, context[SERVER.Fetch]);
    
    context[IOPA.Events].on(IOPA.EVENTS.Response, _invokeOnParentResponse.bind(this, context));
    
};

/**
 * Context Func(tion) to create a new IOPA Request using a Tcp Url including host and port name
 *
 * @method fetch

 * @parm  path url representation of ://127.0.0.1/hello
 * @param options object dictionary to override defaults
 * @param pipeline function(context):Promise  to call with context record
 * @returns Promise<context>
 * @public
 */
function _fetch(channelContext, nextFetch, path, options, pipeline) {
    return nextFetch(path, options, function (childContext) {
           childContext[SERVER.RawStream] = new iopaStream.OutgoingStreamTransform(_writeRequest.bind(this, childContext, childContext[SERVER.RawStream]));
          return pipeline(childContext);
    });
};

/**
 * @method _invokeOnParentResponse
 * @this CacheMatch
 * @param channelContext IOPA parent context dictionary
 * @param context IOPA childResponse context dictionary
 * @param next   IOPA application delegate for the remainder of the pipeline
 */
function _invokeOnParentResponse(parentContext, response) {
   response.log.info("[IOPA] RESPONSE IN " + _responseLog(response))
    
       // HOOK INTO RESPONSE STREAM
   response.response[SERVER.RawStream] = new iopaStream.OutgoingStreamTransform(_writeResponse.bind(this, response.response, response.response[SERVER.RawStream]));
   
};

/**
 * @method _write
 * @param context IOPA context dictionary
 * @param nextStream Stream The raw stream saved that is next in chain for writing
 * @param chunk     String | Buffer The data to write
 * @param encoding String The encoding, if chunk is a String
 * @param callback Function Callback for when this chunk of data is flushed
 * @private
*/
function _writeResponse(context, nextStream, chunk, encoding, callback) {
      nextStream.write(chunk, encoding, callback);
       context.log.info("[IOPA] RESPONSE OUT " + _responseLog(context));
};

/**
 * @method _write
 * @param context IOPA context dictionary
 * @param nextStream Stream The raw stream saved that is next in chain for writing
 * @param chunk     String | Buffer The data to write
 * @param encoding String The encoding, if chunk is a String
 * @param callback Function Callback for when this chunk of data is flushed
 * @private
*/
function _writeRequest(context, nextStream, chunk, encoding, callback) {
    nextStream.write(chunk, encoding, callback);
      context.log.info("[IOPA] REQUEST OUT " + _requestLog(context));
};

function _url(context) {
    return context[IOPA.Scheme]
        + "//" + context[SERVER.RemoteAddress]
        + ":" + context[SERVER.RemotePort]
        + context[IOPA.Path]
        + (context[IOPA.QueryString] ? + context[IOPA.QueryString] : "");
}


function _requestLog(context) {
    return context[IOPA.Method] + " " + context[IOPA.MessageId] + ":" + context[IOPA.Seq] + " "
        + _url(context)
       + "  " + ((context[IOPA.Body] !== null) ? context[IOPA.Body].toString() : "");
}

function _responseLog(response, chunk) {

    return response[IOPA.Method] + " " + response[IOPA.MessageId] + ":" + response[IOPA.Seq] + " "
        + response[IOPA.StatusCode] + "/"
        + response[IOPA.ReasonPhrase]
        + " [" + response[SERVER.RemoteAddress]
        + ":" + response[SERVER.RemotePort] + "]" + "  "
        + ((response[IOPA.Body] !== null) ? response[IOPA.Body].toString() : "");
}

module.exports = MessageLogger;
