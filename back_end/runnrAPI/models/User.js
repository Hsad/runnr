var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  score: Number,
  email: String
});

module.exports = mongoose.model('User', UserSchema);
