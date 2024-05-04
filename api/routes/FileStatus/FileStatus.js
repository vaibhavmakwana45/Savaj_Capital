const express = require("express");
const router = express.Router();
const moment = require("moment");
const FileStatus = require("../../models/FileStatus/FileStatus");

router.post("/file-status", async (req, res) => {
  try {
    const { file_id, user_id, reason, status_img } = req.body;

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, "0");
    const statusId = `${timestamp}${randomString}${randomNumber}`;

    const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    let status = await FileStatus.findOne({
      file_id: file_id,
      user_id: user_id,
    });

    if (status) {
      const newLoanStatus = {
        status_id: statusId,
        reason: reason,
        status_img: status_img,
      };

      status.loan_status.push(newLoanStatus);
      status.updatedAt = currentDate;
    } else {
      status = new FileStatus({
        file_id: file_id,
        user_id: user_id,
        loan_status: [
          {
            status_id: statusId,
            reason: reason,
            status_img: status_img,
          },
        ],
        createdAt: currentDate,
        updatedAt: currentDate,
      });
    }

    await status.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      data: status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
