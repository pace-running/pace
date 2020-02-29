"use strict";

const Q = require('q');
const participants = require('../service/participants');
const calculator = require('../domain/costCalculator');
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
          let cost = calculator.priceFor(participant);
          if (possible_payment.getAmount() == cost) {
            if (participant.has_payed == false) {
              validated_participants.push({
                participant: participant,
                valid: true,
                reason: 'Token gefunden',
                amount: possible_payment.getAmount()
              })
            } else {
              console.log(participant);
              validated_participants.push({
                participant: participant,
                valid: false,
                reason: 'Schon bezahlt',
                amount: possible_payment.getAmount()
              })
            }
          } else {
            validated_participants.push({
              participant: participant,
              valid: false,
              reason: 'Betrag stimmt nicht. Es wurden' + cost + ' Euro erwartet',
              amount: possible_payment.getAmount()
            })
            }
          })
        .catch(() => {
          validated_participants.push({participant: {paymenttoken: token}, valid: false, reason: 'Nicht gefunden:' + possible_payment.getReason(), amount: possible_payment.getAmount()})
        });
     promises.push(participants_promise);
    })
  });
  Promise.all(promises).then(() => deferred.resolve(validated_participants));
  return deferred.promise;
};

payments.confirm = (confirmed_tokens) => {
  if (Array.isArray(confirmed_tokens)) {
    confirmed_tokens.forEach((token) => {
      participants.get.byPaymentToken(token)
        .then((participant) => {
          participants.markPayed(participant.id)
        })
    });
  } else {
    participants.get.byPaymentToken(confirmed_tokens)
      .then((participant) => {
        participants.markPayed(participant.id)
      })
  }
};

module.exports = payments;
