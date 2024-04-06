const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  project_id: {
    type: String,
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  },
  createAt: {
    type: String,
  },
  updateAt: {
    type: String,
  },
});

module.exports = mongoose.model('AdminProject', ProjectSchema);
