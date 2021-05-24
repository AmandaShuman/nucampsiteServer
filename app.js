var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

//establishing the connection to the mongodb server
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/campsite';
const connect = mongoose.connect(url, { //check node-mongoose for notes
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err) //alternative way to using catch method for errors
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//make users authenticate before accessing the data by writing a custom middleware function called auth
function auth(req, res, next) {
  console.log(req.headers); //see what is in request authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) { //if user didn't put in username/password yet
    const err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic'); //let's client know server is requesting basic authentication
    err.status = 401;
    return next(err);
  }

  //if client responds to challenge and this time there is an authorization header - we can parse it and validate username & password
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':'); //explain this as a challenge
  const user = auth[0];
  const pass = auth[1];
  if (user === 'admin' && pass === 'password') {
    return next(); //authorized
  } else {
    const err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic'); 
    err.status = 401;
    return next(err);
  }
}

app.use(auth); //how the auth function will be used

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
