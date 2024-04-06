const express = require('express');
const router = express.Router();
const moment = require('moment');
const ReportingForm = require('../models/AddReportingForm');

router.post('/addform', async (req, res) => {
  try {
    const formData = req.body;

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(5, 15);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, '0');
    const uniqueId = `${timestamp}${randomString}${randomNumber}`;
    formData.form_id = uniqueId;

    formData.createAt = moment().format('YYYY-MM-DD HH:mm:ss');
    formData.updateAt = moment().format('YYYY-MM-DD HH:mm:ss');

    const newForm = new ReportingForm(formData);
    await newForm.save();

    res.status(201).json({ message: 'Form added successfully', form: newForm });
  } catch (error) {
    console.error('Error adding form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/getforms', async (req, res) => {
  try {
    const forms = await ReportingForm.find();
    res.status(200).json({ forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getforms/:admin_id', async (req, res) => {
  try {
    const { admin_id } = req.params;
    let forms = await ReportingForm.find({ admin_id });

    if (!forms || forms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No forms found for this admin'
      });
    }

    // Reverse the forms array
    forms = forms.reverse();

    res.status(200).json({ forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getprojectforms/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    const forms = await ReportingForm.find({ project_id });
    res.status(200).json({ forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/deleteform/:form_id', async (req, res) => {
  try {
    const { form_id } = req.params;

    const deletedForm = await ReportingForm.findOneAndDelete({ form_id });

    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({ message: 'Form deleted successfully', deletedForm });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:form_id', async (req, res) => {
  try {
    const { form_id } = req.params;
    const form = await ReportingForm.findOne({ form_id });
    res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:form_id', async (req, res) => {
  try {
    const { form_id } = req.params;
    const updatedForm = req.body;
    updatedForm.updateAt = new Date();

    const result = await ReportingForm.findOneAndUpdate({ form_id }, updatedForm, { new: true });

    if (!result) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({ message: 'Form updated successfully', form: result });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
