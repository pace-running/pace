# pace

Pace is a registration and management application for running events and competitions.

[![Build Status](https://travis-ci.org/pace-running/pace.svg?branch=master)](https://travis-ci.org/pace-running/pace)
[![Join the chat at https://gitter.im/lplotni/pace](https://badges.gitter.im/lplotni/pace.svg)](https://gitter.im/lplotni/pace?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Greenkeeper badge](https://badges.greenkeeper.io/pace-running/pace.svg)](https://greenkeeper.io/)

## Features
The list of our issues/features can be found on our [Trello board](https://trello.com/b/1gaDEa3O/pace-board).
## Demo
You can check out the latest version of the app on our development environemt: [http://dev.lauf-gegen-rechts.de:3000/](http://dev.lauf-gegen-rechts.de:3000/)
## Development setup
All the parts of pace are [Docker](https://www.docker.com/) containers and can be brought to live by
executing the
`docker-compose up`
command.
Pace will be reachable under [http://localhost:3000](http://localhost:3000).

Currently we have following containers:
* **db** which provides postgres
* **redis** for messaging between pace components
* **pace-pdf** for PDF generation
* **pace-app** running the express pace app

*If you don't have docker on you machine, just follow this instructions for a [mac](https://docs.docker.com/engine/installation/mac/), or this for [linux](https://docs.docker.com/engine/installation/linux/).*

### DB
Pace uses [PostgreSQL](https://www.postgresql.org/) to store its data. To get postgresql running on your machine during development just start the *db container*.
You can either run this to get the database up:

`docker run -p 5432:5432 -d --name 'pace-postgres' -e POSTGRES_PASSWORD='pgtester' -e POSTGRES_DB='pace' -e POSTGRES_USER='pgtester' postgres`

or just do `gulp start-db`.

Whenever you start a fresh postgres instance, don't forget to initialize the
pace db - just execute `gulp create-pace-db`.

To look at the db in your terminal, just connect to the postgres container  via `docker exec -it -u postgres pace-postgres psql`. If you use other name for the container (e.g. `gulp start-db` will result in one that is randomly generated), adapt the exec command.

### REDIS
To decouple our services we use [Redis](https://redis.io/) as the message broker. The *docker-compose* setup will take care of that for you, but if you still want to start it on your own, you need to ensure that it's exposed to the rest of the system. Just run:

``docker run -p 6379:6379 redis:latest``

### Pace-App
Pace-App is currently based on [express.js](http://expressjs.com/) and [node](https://nodejs.org), therefore you will need both on your machine.
* To install node, we recommend to use *nvm*. Look [here](https://github.com/creationix/nvm) for instructions.
* To get all the other dependencies and be able to start **pace** locally, just navigate to the pace folder and run: `npm install`

### Pace-Pdf
Service generating our PDFs. Look at [pace-pdf](https://github.com/lplotni/pace/tree/master/pace-pdf)

#### Starting
Just run `gulp` and open http://localhost:3000 in your browser.

#### Running tests
For **unit** tests: `gulp test`

For **integration** tests: `gulp test-integration`

To execute just a single spec, just pass `--single=/path/to/yourSpec.js` as
additional argument.

For **functional** tests: `gulp test-functional`

#### Running jshint
Here you go: `gulp lint`

## More info
If you would like to contribute, we have also few blog post explaining our
technical choices and setup:

 * [express
   structure](https://lplotni.github.io/blog/2015/08/04/bootstraping-a-node-dot-js-webapp/)
 * [testing](https://lplotni.github.io/blog/2015/10/10/express-testing/)
