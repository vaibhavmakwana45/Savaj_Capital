const express = require("express");
const router = express.Router();
const moment = require("moment");
const BankApproval = require("../../models/Bank/BankApproval");
const File_Uplode = require("../../models/File/File_Uplode");
const User = require("../../models/AddUser");
const { createToken } = require("../../utils/authhelper");
const crypto = require("crypto");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Notification = require("../../models/Notification/Notification");
const AddUser = require("../../models/AddUser");
const BankUser = require("../../models/Bank/BankUserSchema");
const Bank = require("../../models/Bank/BankSchema");

// router.post("/", async (req, res) => {
//   try {
//     const { file_id, bank_id, bankuser_id } = req.body;

//     const existingAssignment = await BankApproval.findOne({
//       file_id,
//       bank_id,
//       bankuser_id,
//     });

//     if (existingAssignment) {
//       return res.status(400).json({
//         success: false,
//         message: "This file is already assigned to this user in this branch.",
//       });
//     }

//     const timestamp = Date.now();
//     const uniqueId = `${timestamp}`;

//     req.body["bank_assign_id"] = uniqueId;
//     req.body["bank_assign_date"] = moment()
//       .utcOffset(330)
//       .format("YYYY-MM-DD HH:mm:ss");

//     var data = await BankApproval.create(req.body);
//     res.json({
//       success: true,
//       data: data,
//       message: "Documents assigned to the bank successfully.",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const { file_id, bank_id, bankuser_id, loan_id, user_id } = req.body;

    const existingAssignment = await BankApproval.findOne({
      file_id,
      bankuser_id,
      bank_id,
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "This file is already assigned to this user in this branch.",
      });
    }

    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    req.body["bank_assign_id"] = uniqueId;
    req.body["bank_assign_date"] = currentDate;
    req.body["createdAt"] = currentDate;
    req.body["updatedAt"] = currentDate;

    const branchAssignData = await BankApproval.create(req.body);
    const loanDetails = await Loan.findOne({ loan_id });

    if (!loanDetails) {
      throw new Error(`Loan with ID ${loan_id} not found.`);
    }

    const userDetails = await AddUser.findOne({ user_id });

    if (!userDetails) {
      throw new Error(`User with ID ${user_id} not found.`);
    }

    const message = `You have a new file assigned on ${moment(
      currentDate
    ).format("MMMM Do YYYY, h:mm:ss a")} for ${loanDetails.loan} of ${userDetails.username
      }.`;

    const notification = new Notification({
      notification_id: uniqueId,
      file_id,
      bankuser_id,
      bank_id,
      loan_id,
      user_id,
      message: message,
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    const savedNotification = await notification.save();

    const bank = await Bank.findOne({ bank_id: bank_id });
    if (!bank) {
      console.error("Bank not found for bank_id:", bank_id);
      return res.status(404).json({
        success: false,
        message: "Bank not found.",
      });
    }

    const bankUser = await BankUser.findOne({ bankuser_id: bankuser_id });
    if (!bankUser) {
      console.error("Bank User not found for bankuser_id:", bankuser_id);
      return res.status(404).json({
        success: false,
        message: "Bank User not found.",
      });
    }

    const logEntry = {
      log_id: `${moment().unix()}_${Math.floor(Math.random() * 1000)}`,
      message: `Assigned to ${bank.branch_name} of ${bank.bank_name} to ${bankUser.bankuser_name}`,
      timestamp: currentDate,
    };

    await File_Uplode.findOneAndUpdate(
      { file_id },
      { $push: { logs: logEntry }, updatedAt: currentDate }
    );

    res.json({
      success: true,
      data: {
        branchAssignData,
        notification: savedNotification,
      },
      message:
        "Documents assigned to the bank and notification sent successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
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

router.get("/bank_user/:bankuser_id", async (req, res) => {
  try {
    const bankuser_id = req.params.bankuser_id;
    var data = await BankApproval.aggregate([
      {
        $match: { bankuser_id: bankuser_id },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const file_id = data[i].file_id;

      const branchUserData = await File_Uplode.findOne({
        file_id: file_id,
      });

      if (branchUserData) {
        const loan_id = branchUserData.loan_id;
        const loantype_id = branchUserData?.loantype_id;
        const user_id = branchUserData?.user_id;
        const loan_data = await Loan.findOne({ loan_id: loan_id });
        const loan_type_data = await Loan_Type.findOne({
          loantype_id: loantype_id,
        });
        const user_data = await User.findOne({ user_id: user_id });

        if (loan_data) {
          data[i].loan = loan_data.loan;
        }
        if (loan_type_data) {
          data[i].loan_type = loan_type_data.loan_type;
        }
        if (user_data) {
          data[i].username = user_data.username;
        }
      }
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
