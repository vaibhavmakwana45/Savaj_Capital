const express = require("express");
const router = express.Router();
const moment = require("moment");
const BankApproval = require("../../models/Bank/BankApproval");
const { createToken } = require("../../utils/authhelper");
const crypto = require("crypto");

router.post("/", async (req, res) => {
  try {
    // let findBranchName = await Bank.findOne({
    //   bank_name: req.body.bank_name,
    // });
    // if (!findBranchName) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["bank_assign_id"] = uniqueId;
    req.body["bank_assign_date"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    var data = await BankApproval.create(req.body);
    res.json({
      success: true,
      data: data,
      message: "Documents assigned to the bank successfully.",
    });
    // } else {
    //   res.json({
    //     statusCode: 201,
    //     message: `${req.body.branch_name} Name Already Added`,
    //   });
    // }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/:bank_assign_id", async (req, res) => {
  try {
    const { bank_assign_id } = req.params;

    // Ensure that updatedAt field is set
    const result = await BankApproval.findOneAndUpdate(
      { bank_assign_id: bank_assign_id },
      { $push: req.body }, // Use $push to add new objects to the arrays
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "New status added successfully.",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "No documents found.",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
