# [![IOPA](http://iopa.io/iopa.png)](http://iopa.io)<br> iopa-logger 

[![Build Status](https://api.shippable.com/projects/TBD/badge?branchName=master)](https://app.shippable.com/projects/TBD) 
[![IOPA](https://img.shields.io/badge/iopa-middleware-99cc33.svg?style=flat-square)](http://iopa.io)
[![limerun](https://img.shields.io/badge/limerun-certified-3399cc.svg?style=flat-square)](https://nodei.co/npm/limerun/)

[![NPM](https://nodei.co/npm/iopa-logger.png?downloads=true)](https://nodei.co/npm/iopa-logger/)

## About
`iopa-logger` is an IOPA middleware for tracing messages  

## Status

Working release

Includes:

 
### Message Logger (middleware)

  * Automatic audit logging of outbound and inbound requests and responses

    
## Installation

    npm install iopa-logger

## Usage
``` js
const MessageLogger = require('iopa-logger').MessageLogger

:
// INBOUND MESSAGES AND CORRESPONDING OUTBOUND RESPONSES
var appServer = new iopa.App();
app.use(MessageLogger);

// OUTBOUND MESSAGES AND CORRESPONDING INBOUND RESPONSES
var server = mqtt.createServer(app.build());
server.connectuse(iopaMessageLogger.connect);         

:


``` 
       
See [`iopa-mqtt`](https://nodei.co/npm/iopa-mqtt/) for a reference implementation of this repository
