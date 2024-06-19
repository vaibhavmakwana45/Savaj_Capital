const express = require("express");
const router = express.Router();
const moment = require("moment");
const Notification = require("../../models/Notification/Notification");

router.get("/", async (req, res) => {
  try {
    const query = {};

    if (req.query.branchuser_id) {
      query.branchuser_id = req.query.branchuser_id;
    }

    if (req.query.bankuser_id) {
      query.bankuser_id = req.query.bankuser_id;
    }

    if (!req.query.branchuser_id && !req.query.bankuser_id) {
      return res.json({
        success: true,
        data: [],
        message: "No notifications found.",
      });
    }

    // Add condition to filter out notifications where isUnRead is false
    query.isUnRead = true;

    const notifications = await Notification.find(query);

    res.json({
      success: true,
      data: notifications,
      message: "Notifications retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
      error: error.message,
    });
  }
});

router.put("/:notification_id", async (req, res) => {
  const { notification_id } = req.params;
  const updateData = req.body;

  try {
    const updatedNotification = await Notification.findOneAndUpdate(
      { notification_id },
      updateData,
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      data: updatedNotification,
      message: "Notification updated successfully.",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification.",
    });
  }
});

module.exports = router;
