/* jshint node: true */
'use strict';

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let bodyParser = require('body-parser');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let flash = require('connect-flash');
var proxy = require('express-http-proxy');


let indexRoute = require('./routes/index');
let impressumRoute = require('./routes/impressum');
let loginRoute = require('./routes/login');
let logoutRoute = require('./routes/logout');

let participantsRoute = require('./routes/participants/participants.js')
let registrationRoute = require('./routes/participants/registration');
let teamsRegistrationRoute = require('./routes/teams/registration');
let teamsParticipantsRoute = require('./routes/teams/participants');
let editParticipantRoute = require('./routes/participants/editParticipant');

let adminRoute = require('./routes/admin/admin');
let apiRoute = require('./routes/api');
let adminParticipantsRoute = require('./routes/admin/participants');
let adminEditParticipantRoute = require('./routes/admin/editParticipant');
let adminAfterRoute = require('./routes/admin/after');
let paymentProcessingRoute = require('./routes/admin/paymentProcessing')
let paymentValidationRoute = require('./routes/admin/paymentValidation');
let couponcodeRoute = require('./routes/admin/couponcodes');
let teamsResultRoute = require('./routes/teams/results');
let certificateRoute = require('./routes/certificate');

let websocket = require("./routes/websocket");
const liveResultRoute = "/live-results";

let config = require('config');
let csrf = require('csurf');

let app = express();
let WebSocketServer = require('ws').Server;

app.locals.node_env = process.env.NODE_ENV;
app.locals.pace_sha = require('./version').sha;
app.locals.eventName = config.get('eventName');
app.locals.eventUrl = config.get('eventUrl');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.disable("x-powered-by");
app.set('trust proxy',config.get('proxy'));

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('tiny', {
  skip: (req, res) => { return res.statusCode < 400;}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended': true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoute);
app.use("/api", function(err, req, res){
  res.status(err.status || 500);
  res.send({
    message: 'Internal Error'
  });
});


var session = require('express-session');
var RedisStore = require('connect-redis')(session);
const Redis = require('ioredis');
let use_ssl = false;
if (process.env.REDIS_URL) {
  use_ssl = process.env.REDIS_URL.startsWith('rediss')
}

const redisclient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379',{tls: use_ssl });
app.use(session(
    {
        store: new RedisStore({client: redisclient}),
        secret: config.get('cookie-secret'),
        signed: true,
        resave: false,
        name: 'pace_session',
        saveUninitialized: false,
        httpOnly: true,
        cookie: {
          secure: config.get('https')
        }
    }));

app.use(csrf());
app.use(function(req, res, next) {
  res.locals._csrf = req.csrfToken();
  next();
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, {username: user.username, role: user.role});
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        if (username === config.get('admin.username') && password === config.get('admin.password')) {
            let user = {username: 'admin', role: 'admin'};
            return done(null, user);
        } else {
            done(null, false, {message: 'Bitte Benutzername und Passwort überprüfen.'});
        }
    }
));

app.use('/pdf', proxy(config.get('pdf-url')));

if (config.get('teamEvent')) {
  app.use('/registration', teamsRegistrationRoute);
  app.use('/results',teamsResultRoute);
  app.use('/participants', teamsParticipantsRoute);
} else {
  app.use('/registration', registrationRoute);
  app.use('/participants', participantsRoute);
}
app.use('/', indexRoute);
app.use('/impressum', impressumRoute);
app.use('/certificate',certificateRoute);
app.use('/paymentvalidation', paymentValidationRoute);
app.use('/editparticipant', editParticipantRoute);

app.use('/login', loginRoute);
app.use('/logout', logoutRoute);

app.use('/admin', adminRoute);
app.use('/admin/participants', adminParticipantsRoute);
app.use('/admin/editparticipant', adminEditParticipantRoute);
app.use('/admin/after', adminAfterRoute);
app.use('/admin/couponcodes', couponcodeRoute);
app.use('/admin/paymentprocessing', paymentProcessingRoute);

/// Websocket initialization
app.startWebSocketServer = (server) => {
  let wss = new WebSocketServer({server: server, path: liveResultRoute });

  wss.on('connection', (ws) => {
    websocket.initClient(ws);

    ws.on('close', () => {
      websocket.closeClient(ws);
    });
  });
};

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
