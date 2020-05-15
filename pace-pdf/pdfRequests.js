/* jshint node: true */
'use strict';

const Q = require('q');
let pdf = require('./pdf/pdfGeneration');
let pdfRequests = {};

const createTaskQueue = require('sync-task-queue');
const taskQueue = createTaskQueue();

pdfRequests.setup = (redis) => {
  redis.subscribe('pace-pdf', (err, count) => {});
  redis.on('message', pdfRequests.enqueue);
};

pdfRequests.process = (channnel, msg) => {
  const deferred = Q.defer();
  let message = pdfRequests.parse(msg)
  console.log('start: ', message.startNumber)
  pdf.generate(message).then(()=>{
    deferred.resolve();
  }).catch(() => {deferred.reject()})
  return deferred.promise
};

pdfRequests.enqueue = (channel,msg) => {
  let message = pdfRequests.parse(msg)
  taskQueue.enqueue(() => pdfRequests.process(channel,msg))
    .then(() => console.log('done:  ', message.startNumber))
    .catch ((e) => console.log('something went wrong?', e));
}
pdfRequests.parse = (message) => {
 return JSON.parse(message);
};

module.exports = pdfRequests;
