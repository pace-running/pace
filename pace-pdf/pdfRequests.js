/* jshint node: true */
'use strict';
let pdf = require('./pdf/pdfGeneration');
let pdfRequests = {};

const createTaskQueue = require('sync-task-queue');
const taskQueue = createTaskQueue();

pdfRequests.setup = (redis) => {
  redis.subscribe('pace-pdf', (err, count) => {});
  redis.on('message', pdfRequests.enqueue);
};

pdfRequests.process = (channnel, msg) => {
  pdf.generate(pdfRequests.parse(msg)).then(()=>{
    console.log('finished writing');
  })
};

pdfRequests.enqueue = (channel,msg) => {
  taskQueue.enqueue(() => pdfRequests.process(channel,msg));
}
pdfRequests.parse = (message) => {
 return JSON.parse(message);
};

module.exports = pdfRequests;
