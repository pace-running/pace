"use strict";

const Q = require('q');
const participants = require('../service/participants');
const tshirts = require('../service/tshirts');
const calculator = require('../domain/costCalculator');
const payments = {};

payments.validate = (possible_payments) => {
  const deferred = Q.defer();
  validate_payments(possible_payments).then((result) => {
    deferred.resolve(result);
  }).catch((err) => {
    deferred.reject(err);
  });
  return deferred.promise;
}

async function validate_payments(possible_payments) {
  let validated_participants = [];
  for (const possible_payment of possible_payments) {
    for (const token of possible_payment.getPossibleTokens()) {
      try {
        let participant = await participants.get.byPaymentToken(token)
        let valid_amount = await validate_amount(participant, possible_payment.getAmount());
        let current_participant = {
          participant: participant,
          amount: possible_payment.getAmount(),
          valid: true,
          reason: 'Token gefunden'
        };
       if (!valid_amount) {
            current_participant.valid = false;
            current_participant.reason = 'Ungültiger Betrag ';
        }
        if (participant.has_payed == true) {
          current_participant.valid = false;
          current_participant.reason = 'Schon bezahlt'
        }
        validated_participants.push(current_participant);
      }
      catch(e) {
        validated_participants.push({participant: {paymenttoken: token}, valid: false, reason: 'Nicht gefunden:' + possible_payment.getReason(), amount: possible_payment.getAmount()})
      }
    }
  }
  return validated_participants;
}

async function validate_amount(participant,expected_amount) {
 let p = await tshirts.findAndAddTo(participant);
 let amount_to_pay = await calculator.priceFor(p);
 if ((amount_to_pay == expected_amount) || ((amount_to_pay + 4) == expected_amount)) {
   return true;
 } else {
   return false;
 }
}

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
