"use strict";

const bankStatement = require('service/bankStatement');

const payments = {};

payments.processBankStatement = (file) => {
  return bankStatement.parse(file)
};

module.exports = payments;
