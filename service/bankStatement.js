"use strict";

const csv = require('fast-csv');
const Q = require("q");

const headers = [
    'Buchungstag', 'Valuta', 'Auftraggeber/Zahlungsempfänger', 'Empfänger/Zahlungspflichtiger', 'Konto-Nr.', 'IBAN', 'BLZ', 'BIC', 'Vorgang/Verwendungszweck', 'Kundenreferenz', 'Währung', 'Umsatz', 'H'
];
const buchungstagPattern = /\d{2}\.\d{2}\.\d{4}/;

const bankStatement = {};
bankStatement.parse = (file) => {
  const deferred = Q.defer();
  const results = [];
  csv
    .fromPath(file, {delimiter: ';', headers: headers})
    .on("data", (data) => {
      if(buchungstagPattern.test( data.Buchungstag))
        results.push(data)
    })
    .on("end", () => deferred.resolve(results));
  return deferred.promise;
};

module.exports = bankStatement;
