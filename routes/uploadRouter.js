const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

/**
 * custom configuration for how multer handles file uploads (optional)
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname) //makes sure file on server is same name as file on client side rather than string
  }
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //what about iphone heic?
    return cb(new Error('You can upload only image files!'), false);
  }
  cb(null, true); //since return statement in if block then filename has image extension
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter }); //mulit-module is configured to enable image file uploads

const uploadRouter = express.Router();

/**
 * configure uploadRouter to handle various http requests
 */
uploadRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => { //expecting single upload of a file whose input name is imageFile - multer takes care of everything else
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file); //will confirm to client that file has been received correctly
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
  })

module.exports = uploadRouter;