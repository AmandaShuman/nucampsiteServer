const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); //since we created it with the usersSchema, it already has access to the passport local mongoose plugin already

exports.local = passport.use(new LocalStrategy(User.authenticate())); //how we add the specific strategy plugin we want to use - if not using passport-local-mongoose plugin, we would need something else other than User.authenticate()

//need to do this whenever using passport
passport.serializeUser(User.serializeUser()); //when we receive data about user from request object, we need to convert it to store in the session data
passport.deserializeUser(User.deserializeUser()); //when user has been verified, user data has to be grabbed from session and added to request object