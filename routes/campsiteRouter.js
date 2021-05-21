//will contain the code for handling the rest api endpoints for campsites and campsites/campsiteId
const express = require('express');
const Campsite = require('../models/campsite'); //allows us to use campsite model exported from that module
const campsiteRouter = express.Router(); //to create a new express router. This gives us an object name that we can use with express routing methods

//handle the routing part. 
campsiteRouter.route('/')
.get((req, res, next) => { 
  Campsite.find()
  .then(campsites => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsites);
  })   
  .catch(err => next(err)); //will pass off error to overall error handler for overall express app
})
.post((req, res, next) => { 
  Campsite.create(req.body) //create new campsite doc and save it to mongodb server
  .then(campsite => {
    console.log('Campsite Created', campsite);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite); //sends info about posted info to client
  })
  .catch(err => next(err));
})
.put((req, res) => {
  res.statusCode = 403;  
  res.end('PUT operation not supported on /campsties');
})
.delete((req, res, next) => {  //dangerous operation so don't want to just let anyone do it
  Campsite.deleteMany()
  .then(response => { //gives info about info deleted
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
  .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
  Campsite.findById(req.params.campsiteId) //id getting parsed by http request by what user typed in as id they wanted
  .then(campsite => { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.post((req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res, next) => {
  Campsite.findByIdAndUpdate(req.params.campsiteId, { 
    $set: req.body
  }, {new: true })
  .then(campsite => { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.delete((req, res, next) => {
  Campsite.findByIdAndDelete(req.params.campsiteId)
  .then(response => { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
    .catch(err => next(err));
});
  
campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => { 
  Campsite.findById(req.params.campsiteId) //client looking for a single campsite's comments now using findById
  .then(campsite => {
    if (campsite) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(campsite.comments);
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    }
  })   
  .catch(err => next(err));
})
.post((req, res, next) => { 
  Campsite.findById(req.params.campsiteId) 
  .then(campsite => {
    if (campsite) {
      campsite.comments.push(req.body); //use array method to push new comment into comments arrray. Assuming request body has comment in it and express.json has already formatted it so we can push it in. Only changes comments array in app memory andn not subcomments doc in mongodb
      campsite.save() //saves the new comment to mongodb database. Not a static method b/c method being performed on this instance the doc itself so little c for campsite
      .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
      })
      .catch(err => next(err));
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    }
  })   
  .catch(err => next(err));
})
.put((req, res) => {
  res.statusCode = 403;  
  res.end(`PUT operation not supported on /campsties/${req.params.campsiteId}/comments`);
})
.delete((req, res, next) => {  
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite) {
      for (let i = (campsite.comments.length-1); i>=0; i--) {
        //access each comment in comments sub doc array one at a time to remove them one by one
        campsite.comments.id(campsite.comments[i]._id).remove();
      } 
      campsite.save()
        .then(campsite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(campsite);
        })
        .catch(err => next(err));
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    }
  })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments/:commentId') //will handle requests of a specific comment id of a specific campsite id
  .get((req, res, next) => {
    Campsite.findById(req.params.campsiteId) 
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) { //will retrieve the value of the comment subdoc with id passed in
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(campsite.comments.id(req.params.commentId)); //safe to do b/c we have checked that there is a truthy value for comment
        } else if (!campsite) { 
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
  })
  .put((req, res, next) => { //we want to update existing data - don't want to update author, cannot update id or timestamp fields, so only want to update rating and comment text fields
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) { 
          if (req.body.rating) {
            campsite.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if (req.body.text) {
            campsite.comments.id(req.params.commentId).text = req.body.text;
          } 
          campsite.save()
          .then(campsite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite);
          })
          .catch(err => next(err));
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          campsite.comments.id(req.params.commentId).remove();
          campsite.save()
            .then(campsite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(campsite);
            })
            .catch(err => next(err));
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  });

module.exports = campsiteRouter;
