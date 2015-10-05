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
MessageLogger.prototype.channel = function MessageLogger_channel(channelContext, next) {
     channelContext[IOPA.Events].on(IOPA.EVENTS.Response, _invokeOnParentResponse.bind(this, channelContext));  
     return next();
};

/**
 * @method invoke
 * @param context IOPA context dictionary
 * @param next   IOPA application delegate for the remainder of the pipeline
 */
MessageLogger.prototype.invoke = function MessageLogger_invoke(context, next) {
        context.log.info("[IOPA] REQUEST IN " + _requestLog(context))
        return next();
   
};

/**
 * @method invoke
 * @param context IOPA context dictionary
 * @param next   IOPA application delegate for the remainder of the pipeline
 */
MessageLogger.prototype.connect = function MessageLogger_connect(context, next) {
     context[IOPA.Events].on(IOPA.EVENTS.Response, _invokeOnParentResponse.bind(this, context));
     return next();
 
};

/**
 * @method connect
 * @this context IOPA context dictionary
 */
MessageLogger.prototype.dispatch = function MessageLogger_dispatch(context, next) {
    if (context[SERVER.IsRequest])
       context.log.info("[IOPA] REQUEST OUT " + _requestLog(context));
    else
       context.log.info("[IOPA] RESPONSE OUT " + _responseLog(context));
    
    return next();
}

/**
 * @method _invokeOnParentResponse
 * @this CacheMatch
 * @param channelContext IOPA parent context dictionary
 * @param context IOPA childResponse context dictionary
 * @param next   IOPA application delegate for the remainder of the pipeline
 */
function _invokeOnParentResponse(parentContext, response) {
   response.log.info("[IOPA] RESPONSE IN " + _responseLog(response))   
};

function _url(context) {
    return context[IOPA.Scheme]
        + "//" + context[SERVER.RemoteAddress]
        + ":" + context[SERVER.RemotePort]
        + context[IOPA.Path]
        + (context[IOPA.QueryString] ? "?" + context[IOPA.QueryString] : "");
}


function _requestLog(context) {
    return context[IOPA.Method] + " " + (context[IOPA.MessageId] || "") + ":" + context[IOPA.Seq] + " "
        + _url(context)
}

function _responseLog(response, chunk) {

    return (response[IOPA.Method] || response[IOPA.Protocol]) + " " + (response[IOPA.MessageId] || "") + ":" + response[IOPA.Seq] + " "
        + response[IOPA.StatusCode] + "/"
        + response[IOPA.ReasonPhrase]
        + " [" + response[SERVER.RemoteAddress]
        + ":" + response[SERVER.RemotePort] + "]" + "  "
}

module.exports = MessageLogger;
