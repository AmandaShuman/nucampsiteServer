const express = require('express');
const Favorite = require('../models/favorite');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.route('/')
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      })
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (!favorite) {
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then(favorites => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            })
            .catch(err => next(err));
        } else {
          req.body.forEach(favorite => {
            if (!favorite.campsites.includes(favorite._id)) {
              favorite.campsites.push(favorite);
            }
          });
          favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then(response => {
      if (!response) {
        err = new Error('You do not have any favorites to delete.');
        err.status = 404;
        res.setHeader('Content-Type', 'text/plain');
        return next(err);
      } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(response);
      }
    })
    .catch(err => next(err));
  });

favoriteRouter.route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (!favorite) {
          Favorite.create({ 
            user: req.user._id,
            campsites: [req.params.campsiteId] 
          })
            .then(favorites => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            })
            .catch(err => next(err));
        } else if (!favorite.campsites.includes(favorite._id)) {
            favorite.campsites.push(favorite);
            favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(err => next(err));
        } else {
          res.send("That campsite is already in the list of favorites!");
        } 
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
      if (!favorite) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('There are no favorites to delete.');
      } else {
        const index = favorite.campsites.indexOf(req.params.campsiteId);
        if (index >= 0) {
          favorite.campsites.splice(index, 1);
        } 
        favorite.save()
          .then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
  });

module.exports = favoriteRouter;