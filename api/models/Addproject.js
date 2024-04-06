const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  project_id: {
    type: String,
    unique: true
  },
  admin_id: {
    type: String,
    unique: true
  },
  projectName: {
    type: String
  },
  fileUrl: {
    type: String
  },
  projectShortName: {
    type: String
  },
  priority: {
    type: String
  },
  description: {
    type: String,
    lowercase: true
  },
  startDate: {
    type: String
  },
  endDate: {
    type: String
  },
  createAt: {
    type: String
  },
  updateAt: {
    type: String
  }
});

module.exports = mongoose.model('AllProject', ProjectSchema);
