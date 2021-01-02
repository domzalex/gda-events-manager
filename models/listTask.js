const mongoose = require("mongoose");

const listTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  postDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ListTask', listTaskSchema);
