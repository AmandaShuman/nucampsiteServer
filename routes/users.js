const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) { //need to verify first user, then whether user is admin or not
  User.find() //similar to Get method in partnerRouter
    .then(admins => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(admins);
    })
    .catch(err => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res) => { //will allow new user to sign up on website
  User.register(
    new User({ username: req.body.username }), //1st arg is new user creation
    req.body.password, //2nd arg is password directly from client
    (err, user) => {
      if (err) { //internal server error
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err }); //will provide info about error
      } else { //will ensure registration was successful
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save(err => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' }); //takes care of sending response so no need for ending it
          });
        });
      }
    }
  );
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  //passport.authentication will now handle logging in user for us from now on
  const token = authenticate.getToken({ _id: req.user._id }); //issue token to user
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

//handles logging out
router.get('/logout', cors.corsWithOptions, (req, res, next) => {
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

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  }
});

module.exports = router;
