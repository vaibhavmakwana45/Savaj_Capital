const mongoose = require('mongoose');

const ReportingFormSchema = new mongoose.Schema({
  formName: {
    type: String,
    required: true
  },
  form_id: {
    type: String
  },
  admin_id: {
    type: String
  },
  project_id: {
    type: String
  },
  projectName: {
    type: String
  },
  fields: [
    {
      fieldName: {
        type: String,
        required: true
      },
      fieldType: {
        type: String,
        enum: ['text', 'textarea', 'number', 'checkbox', 'radio', 'date'],
        required: true
      },
      options: {
        type: [String],
        default: []
      }
    }
  ],
  createAt: {
    type: String
  },
  updateAt: {
    type: String
  }
});

module.exports = mongoose.model('AllReportingForm', ReportingFormSchema);
