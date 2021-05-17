//will contain the code for handling the rest api endpoints for campsites and campsites/campsiteId
const express = require('express');
//to create a new express router. This gives us an object name that we can use with express routing methods
const campsiteRouter = express.Router();

//handle the routing part. 
campsiteRouter.route('/')

//a routing method that is a catchall for all http verbs - use to set properties on response object that we will use as defaults for the path (so we don't need repeats individually)
//format is app.all('path',callback method)
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');  //send back plain text in response body
  next(); //passes control of the app routing to the next RELEVANT routing method after this one
})
.get((req, res) => {     //don't need next bc not passing any more routings after this
  //response status code and headers already set by app.all method
  res.end('Will send all the campsites to you');
})
.post((req, res) => {    //post requests typically cary some info (usually json format)
  //this is why the express.json file is imporant!
  res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
})
.put((req, res) => {
  res.statusCode = 403;   //code when operation is not supported
  res.end('PUT operation not supported on /campsties');
})
.delete((req, res) => {  //dangerous operation so don't want to just let anyone do it
  res.end('Deleting all campsites');
});

campsiteRouter.route('/:campsiteId')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');  //send back plain text in response body
  next();
})
.get((req, res) => {
  res.end(`Will send details of the campsite: ${req.params.campsiteId} to you`);
})
.post((req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res) => {
  res.write(`Updating the campsite: ${req.params.campsiteId}\n`);
  res.end(`Will update the campsite: ${req.body.name}
        with description: ${req.body.description}`);
})
.delete((req, res) => {
  res.end(`Deleting campsite: ${req.params.campsiteId}`);
});
  
module.exports = campsiteRouter;
