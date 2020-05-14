/* jshint node: true */
'use strict';

const Redis = require('ioredis');
let use_ssl = false;
if (process.env.REDIS_URL) {
  use_ssl = process.env.REDIS_URL.startsWith('rediss')
}
const pdfRequests = require('./pdfRequests');
const express = require('express');
let apiRoute = require('./routes/api');
let healthRoute = require('./routes/health');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {tls: use_ssl});
pdfRequests.setup(redis);


let app = express();
app.use('/pdf', apiRoute);
app.use('/health',healthRoute);

app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ', server.address().port);
});

