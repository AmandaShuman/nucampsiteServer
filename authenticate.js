const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); 
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt; //object that provides helper methods
const jwt = require('jsonwebtoken');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate())); //how we add the specific strategy plugin we want to use - if not using passport-local-mongoose plugin, we would need something else other than User.authenticate()

//need to do this whenever using passport
passport.serializeUser(User.serializeUser()); //when we receive data about user from request object, we need to convert it to store in the session data
passport.deserializeUser(User.deserializeUser()); //when user has been verified, user data has to be grabbed from session and added to request object

exports.getToken = user => { //function that receives object called user
  return jwt.sign(user , config.secretKey, {expiresIn: 3600}); //in real app - you may want to set value for a few days or longer (recommended to always have this)
};

//configure the json web token strategy for passport
const opts = {}; //contains options for jwt strategy
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //specifies how token should be extracted - send it to us an an authorization header and as a bearer token
opts.secretOrKey = config.secretKey; //option lets us apply jwt strategy with the key with which we'll assign token 

exports.jwtPassport = passport.use(
  new JwtStrategy(
    opts,
    (jwt_payload, done) => {
      console.log('JWT payload:', jwt_payload);
      User.findOne({_id: jwt_payload._id}, (err, user) => { //try to find user with same id as in token
        if (err) {
          return done(err, false); //false means no user was found
        } else if (user) {
          return done(null, user); //null means no error
        } else { //means no error, but no user doc was found to match
          return done(null, false); //could set up code her to prompt to create a new user account too
        }
      });
    }
  )
);

exports.verifyUser = passport.authenticate('jwt', {session: false}); //verify that incoming request is coming from authenticated user - shortcut to use in other modules we want to authenticate w/ jwt strategy

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    return next();
  } else {
    err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    return next(err);
  }
};