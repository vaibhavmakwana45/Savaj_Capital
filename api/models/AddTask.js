// task.js (Model for Task)
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  formId: { type: String, ref: 'ReportingForm', required: true },
  userId: { type: String, ref: 'ReportingForm', required: true },
  adminId: { type: String, ref: 'ReportingForm', required: true },
  taskId: { type: String, ref: 'ReportingForm', required: true },
  projectId: { type: String, ref: 'ReportingForm', required: true },
  projectName: { type: String, ref: 'ReportingForm', required: true },
  formFields: {
    type: Object,
    required: true  
  },
  createAt: {
    type: String
  },
  updateAt: {
    type: String
  }
});

const Task = mongoose.model('AllTask', TaskSchema);

module.exports = Task;
