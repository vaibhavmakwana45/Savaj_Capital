const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true
  },
  admin_id: {
    type: String
  },
  project_ids: [
    { 
      type: String
    }
  ],
  projectNames: [
    {
      type: String
    }
  ],
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
    default: 'activate'
  },
  createAt: {
    type: String
  },
  updateAt: {
    type: String
  }
});

module.exports = mongoose.model('AllUser', UserSchema);
