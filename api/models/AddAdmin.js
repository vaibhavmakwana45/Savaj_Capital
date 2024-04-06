const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  companyname: {
    type: String
  },
  email: {
    type: String,
    lowercase: true
  },
  phonenumber: {
    type: String
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  status: {
    type: String,
    default: 'pending'
  },
  createAt: {
    type: String
  },
  updateAt: {
    type: String
  }
});

module.exports = mongoose.model('AllAdmin', AdminSchema);
