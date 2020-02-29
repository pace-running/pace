"use strict";

const Q = require('q');
const participants = require('../service/participants')
const payments = {};

payments.validate = (possible_payments) => {
  const deferred = Q.defer();
  let validated_participants = [];
  let promises = [];
  possible_payments.forEach((possible_payment) => {
    let confirmed_payment = possible_payment.getPossibleTokens();
    confirmed_payment.forEach((token) => {
      let participants_promise = participants.get.byPaymentToken(token)
        .then((participant) => {
          validated_participants.push({participant: participant, valid: true, reason: possible_payment.getReason(), amount: possible_payment.getAmount()})
        })
        .catch(() => {
          validated_participants.push({participant: {paymenttoken: token}, valid: false, reason: possible_payment.getReason(), amount: possible_payment.getAmount()})
        });
     promises.push(participants_promise);
    })
  });
  Promise.all(promises).then(() => deferred.resolve(validated_participants));
  return deferred.promise;
};

payments.confirm = (confirmed_tokens) => {
  const deferred = Q.defer();
  confirmed_tokens.forEach((token) => {
    participants.get.byPaymentToken(token)
      .then((participant) => {
        participants.markPayed(participant.id)
      })
  });
};

module.exports = payments;
