const paceConfiguration = require('config')
const Pool = require('pg').Pool;
const crypto = require('crypto');
const participant = require('../../domain/participant');
const participants = require('../../service/participants');
const couponcodes = require('../../service/couponcodes');
const registration = require('../../service/registration');

let createUser = () => {
  let randomString = crypto.randomBytes(8).toString('hex');
  let aParticipant = participant.from({
    firstname: 'Friedrich',
    lastname: 'Schiller',
    email: randomString + '@example.com',
    category: 'f',
    birthyear: 1980,
    team: 'Crazy runners',
    visibility: 'no'
  }).withToken(randomString)
    .withSecureId('secureIdForTheEditLink')
    .withStartNr(10);
  return participants.save(aParticipant);
};

module.exports = (on, config) => {
  on('task', {
    validUser () {
      return createUser()
    },
    couponcode () {
     return couponcodes.create()
    },
    registration (status) {
      if (status === 'close') {
        return registration.close();
      }
      else {
        return registration.reopen();
      }

    },
    getConfig (key) {
      return paceConfiguration.get(key);
    },
    resetDb () {
      pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'tcp://pgtester:pgtester@localhost/pace' });
        pool.connect().then(client => {
          client.query('delete from couponcodes')
          .then(() => client.query('delete from tshirts'))
          .then(() => client.query('delete from participants'))
          .then(() => client.query('delete from race'))
          .then(() => client.query('delete from startblocks;'))
          .then(() => client.release())
        }).catch((err) => {
          console.error(err)
        });
      return 'done'
    },
  })
};
