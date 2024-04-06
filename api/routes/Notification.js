const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const moment = require('moment');
const AddProject = require('../models/Addproject');
const User = require('../models/AddUser');
const ReportingForm = require('../models/AddReportingForm');

router.post('/notifications', async (req, res) => {
  try {
    const { userId, projectId, actionType, adminId } = req.body;
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

router.post('/formnotifications', async (req, res) => {
  try {
    const { formId, projectId, actionType, adminId } = req.body;

    const users = await User.find({ project_ids: projectId });

    const userIds = users.map((user) => user.user_id);
    console.log('User IDs to save:', userIds);
    if (users.length === 0) {
      console.log('No users found for project ID:', projectId);
    }
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(5, 15);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, '0');
    const uniqueId = `${timestamp}${randomString}${randomNumber}`;

    const notificationUniqueId = uniqueId;

    const newNotification = new Notification({
      notification_id: notificationUniqueId,
      formId,
      projectId,
      actionType,
      adminId,
      users_ids: userIds,
      createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updateAt: moment().format('YYYY-MM-DD HH:mm:ss')
    });

    const savedNotification = await newNotification.save();
    console.log('User IDs to save:', userIds);
    console.log('Notification object before save:', newNotification);

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

router.get('/userNotifications/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({
      $or: [{ userId: userId }, { users_ids: userId }]
    });

    if (notifications.length === 0) {
      return res.status(404).json({
        success: true,
        message: 'No notifications found'
      });
    }

    // Enhance notifications with project and form details
    const enhancedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const project = await AddProject.findOne({ project_id: notification.projectId });
        let form = null;

        if (notification.formId) {
          form = await ReportingForm.findOne({ form_id: notification.formId });
        }

        return {
          ...notification.toObject(),
          projectDetails: project ? project.toObject() : null,
          formDetails: form ? form.toObject() : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enhancedNotifications,
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message
    });
  }
});

router.delete('/notifications/:notificationId', async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.body;

  try {
    const notification = await Notification.findOne({ notification_id: notificationId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.formId && notification.users_ids && notification.users_ids.length) {
      notification.users_ids = notification.users_ids.filter((id) => id !== userId);

      if (notification.users_ids.length === 0) {
        await Notification.deleteOne({ notification_id: notificationId });
      } else {
        await notification.save();
      }
    } else {
      await Notification.deleteOne({ notification_id: notificationId });
    }

    res.json({ success: true, message: 'Notification updated or deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;
