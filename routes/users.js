const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => { //will allow new user to sign up on website
  User.findOne({username: req.body.username}) //check that username isn't already taken
  .then(user => {
    if (user) { //username already exists
      const err = new Error(`User ${req.body.username} already exists!`);
      err.status = 403;
      return next(err);
    } else {
      User.create({ //create new document
        username: req.body.username,
        password: req.body.password //no admin field here so client cannot turn themselves into admins
      })
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({status: 'Registration Successful!', user: user});
      })
      .catch(err => next(err));
    }
  })
  .catch(err => next(err)); //means something went wrong with method, not that user wasn't found
});

router.post('/login', (req, res, next) => {
  //check if user is already logged in
  if (!req.session.user) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];
    
    User.findOne({username: username}) //check username and password against docs in the database
    .then(user => {
      if(!user) {
        const err = new Error(`User ${username} does not exist!`);
        err.status = 401;
        return next(err);
      } else if (user.password !== password) { //if username exists but password doesn't match
        const err = new Error('Your password is incorrect');
        err.status = 401;
        return next(err);
      } else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated');
      }
    })
    .catch(err => next(err));
  } else { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!'); 
  }
});

//handles logging out
router.get('/logout', (req, res, next) => {
  if (req.session) { //check if session exists
    req.session.destroy(); //deleting session file on server side
    res.clearCookie('session-id'); //clears the cookie that is stored on the client
    res.redirect('/'); 
  } else { //if requesting to log out but not actually logged in
    const err = new Error('You are not logged in');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
