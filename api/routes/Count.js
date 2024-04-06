const express = require('express');
const router = express.Router();

// Assuming you have these models
const AddAdmin = require('../models/AddAdmin');
const AddProject = require('../models/Addproject');
const AddReportingForm = require('../models/AddReportingForm');
const AddUser = require('../models/AddUser');
const AddTask = require('../models/AddTask');

router.get('/allcounts/:adminId', async (req, res) => {
  // Extracting adminId from the route parameter
  const adminId = req.params.adminId; // Make sure this matches the URL parameter

  try {
    // Execute all count queries in parallel
    // Assuming the same adminId (`user_id` from admin collection) is used across different documents
    const counts = await Promise.all([
      AddProject.countDocuments({ admin_id: adminId }),
      AddReportingForm.countDocuments({ admin_id: adminId }),
      AddUser.countDocuments({ admin_id: adminId }), // Assuming you want to count something specific to the user/admin
      AddTask.countDocuments({ adminId: adminId })
    ]);

    // Extract counts into separate variables
    const [projectCount, reportingFormCount, userCount, taskCount] = counts;

    res.json({
      success: true,
      counts: {
        projects: projectCount,
        reportingForms: reportingFormCount,
        users: userCount,
        tasks: taskCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});



module.exports = router;
