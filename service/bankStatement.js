"use strict";

const csv = require('@fast-csv/parse');
const Q = require("q");

const headers = [
    'Buchungstag', 'Valuta', 'Auftraggeber/Zahlungsempfänger', 'Empfänger/Zahlungspflichtiger', 'Konto-Nr.', 'IBAN', 'BLZ', 'BIC', 'Vorgang/Verwendungszweck', 'Kundenreferenz', 'Währung', 'Umsatz', 'H'
];
const TOKEN_LENGTH = 9;

const buchungstagPattern = /\d{2}\.\d{2}\.\d{4}/;

function PaymentRow(statement) {
  const reason = statement['Vorgang/Verwendungszweck'];
  const removeUberweisung = (text) => text.replace(/^.*berweisungsgutschr\./, '');
  const removeNewLines = (text) => text.replace(/\n/g, '');
  const removeIBAN = (text) => text.replace(/IBAN:\sDE\d{20}/g, '');
  const removeBIC = (text) => text.replace(/BIC:\s\w{11}/, '');

  const getReason = () => reason;

  const getAmount = () => {
    return statement['Umsatz'];
  }

  const getPossibleTokens = () => {
    return removeBIC(removeIBAN(removeNewLines(removeUberweisung(reason))))
      .trim()
      .split(' ')
      .filter(text => text.length===TOKEN_LENGTH);
  };

  return {
    getPossibleTokens,
    getReason,
    getAmount
  }
}

const bankStatement = {};
bankStatement.parse = (file) => {
  const deferred = Q.defer();
  const results = [];
  csv
    .parseFile(file.path, {delimiter: ';', headers: headers})
    .on('error', error => console.error('AAAAAHHH:', error))
    .on("data", (statement) => {
      if(buchungstagPattern.test( statement.Buchungstag))
        results.push(new PaymentRow(statement))
    })
    .on("end", () => deferred.resolve(results));
  return deferred.promise;
};

module.exports = bankStatement;
