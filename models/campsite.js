//where we define mongoose schema and the model for all documents in databases campsites collection
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose); //loads new currency type into mongoose
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({ //for storing commnts about a campsite
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, //stores a reference to a user doc through userdoc id
    ref: 'User'
  }
}, {
  timestamps: true
});

//schema
const campsiteSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  elevation: {
    type: Number,
    required: true
  },
  cost: {
    type: Currency,
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  comments: [commentSchema]
}, {
  timestamps: true
});

//model that uses schema
const Campsite = mongoose.model('Campsite', campsiteSchema); //creates a model named Campsites - 1st argument needs to be capitalized and singularized version - mongoose will automatically look for lower-case, plural version; 2nd argument is the schema you want to use
//this model will be used to instantiate documents for mongodb

module.exports = Campsite;