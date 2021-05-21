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
  
module.exports = campsiteRouter;
