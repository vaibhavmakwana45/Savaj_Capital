const express = require('express');
const router = express.Router();
const Notification = require('../models/AdminNotification');
const moment = require('moment');
const AddProject = require('../models/Addproject');
const User = require('../models/AddUser');
const ReportingForm = require('../models/AddReportingForm');

router.post('/adminnotifications', async (req, res) => {
  try {
    const { userId, projectId, actionType, adminId, formId } = req.body;
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(5, 15);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, '0');

    const uniqueId = `${timestamp}${randomString}${randomNumber}`;

    const notificationUniqueId = (req.body['chat_id'] = uniqueId);

    const newNotification = new Notification({
      notification_id: notificationUniqueId,
      userId,
      projectId,
      actionType,
      adminId,
      formId,
      createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updateAt: moment().format('YYYY-MM-DD HH:mm:ss')
    });

    const savedNotification = await newNotification.save();

    res.status(201).json({
      success: true,
      data: savedNotification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
});

router.get('/adminNotifications/:adminId', async (req, res) => {
  const { adminId } = req.params;

  try {
    // Fetch notifications for the given adminId
    const notifications = await Notification.find({ adminId });

    if (notifications.length === 0) {
      return res.status(404).json({
        success: true,
        message: 'No notifications found for the given admin ID'
      });
    }

    const enhancedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const project = await AddProject.findOne({ project_id: notification.projectId });

        let form = null;
        if (notification.formId) {
          form = await ReportingForm.findOne({ form_id: notification.formId });
        }

        const user = await User.findOne({ user_id: notification.userId });

        return {
          ...notification.toObject(),
          projectDetails: project ? project.toObject() : null,
          formDetails: form ? form.toObject() : null,
          userDetails: user ? user.toObject() : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enhancedNotifications,
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message
    });
  }
});

router.delete('/adminnotifications/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const deletionResult = await Notification.deleteOne({ notification_id: notificationId });

    // Check if a document was found and deleted
    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;
