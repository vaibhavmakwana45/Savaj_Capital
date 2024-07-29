const express = require("express");
const router = express.Router();
const moment = require("moment");
const Bank = require("../../models/Bank/BankSchema");
const BankUser = require("../../models/Bank/BankUserSchema");
const { createToken } = require("../../utils/authhelper");
const crypto = require("crypto");
const BankApproval = require("../../models/Bank/BankApproval");
const File_Uplode = require("../../models/File/File_Uplode");
const LoanStatus = require("../../models/AddDocuments/LoanStatus");
const AddUser = require("../../models/AddUser");
const Loan = require("../../models/Loan/Loan");

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "vaibhav");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (text) => {
  const decipher = crypto.createDecipher("aes-256-cbc", "vaibhav");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

router.post("/addbankuser", async (req, res) => {
  try {
    let findBranchName = await Bank.findOne({
      bank_name: req.body.bank_name,
      branch_name: req.body.branch_name,
      state: req.body.state,
      city: req.body.city,
    });
    if (!findBranchName) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["bank_id"] = uniqueId;
      req.body["createdAt"] = currentDate;
      req.body["updatedAt"] = currentDate;

      var data = await Bank.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Branch Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.branch_name} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const banks = await Bank.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
      {
        $lookup: {
          from: "bank-users",
          localField: "bank_id",
          foreignField: "bank_id",
          as: "bank_users",
        },
      },
      {
        $addFields: {
          user_count: { $size: "$bank_users" },
        },
      },
    ]);

    const bankIds = banks.map((bank) => bank.bank_id);
    const bankUsers = await BankUser.find({ bank_id: { $in: bankIds } }).lean();
    const bankUserIds = bankUsers.map((user) => user.bankuser_id);
    const bankApprovals = await BankApproval.find({ bankuser_id: { $in: bankUserIds } }).lean();
    const fileIds = bankApprovals.map((approval) => approval.file_id);
    const files = await File_Uplode.find({ file_id: { $in: fileIds } }).lean();

    const loanStatusIds = files.map((file) => file.status);
    const loanStatuses = await LoanStatus.find({ loanstatus_id: { $in: loanStatusIds } }).lean();

    const userIds = files.map((file) => file.user_id);
    const users = await AddUser.find({ user_id: { $in: userIds } }).lean();

    const loanIds = files.map((file) => file.loan_id);
    const loans = await Loan.find({ loan_id: { $in: loanIds } }).lean();

    const loanStatusMap = new Map(loanStatuses.map((status) => [status.loanstatus_id, status]));
    const userMap = new Map(users.map((user) => [user.user_id, user]));
    const loanMap = new Map(loans.map((loan) => [loan.loan_id, loan]));

    const fileDetailsMap = new Map(
      files.map((file) => {
        const statusDetails = loanStatusMap.get(file.status);
        const userDetails = userMap.get(file.user_id);
        const loanDetails = loanMap.get(file.loan_id);

        return [
          file.file_id,
          {
            ...file,
            status: statusDetails ? statusDetails.loanstatus : file.status,
            status_color: statusDetails ? statusDetails.color : undefined,
            user_details: userDetails,
            loan_details: loanDetails,
          },
        ];
      })
    );

    const bankUserFiles = bankUsers.reduce((acc, user) => {
      const assignedFiles = bankApprovals
        .filter((approval) => approval.bankuser_id === user.bankuser_id)
        .map((approval) => ({
          ...approval,
          file_details: fileDetailsMap.get(approval.file_id),
        }));
      acc[user.bank_id] = acc[user.bank_id] || [];
      acc[user.bank_id].push({
        ...user,
        files: assignedFiles,
      });
      return acc;
    }, {});

    banks.forEach((bank) => {
      bank.users = bankUserFiles[bank.bank_id] || [];
      bank.file_count = bank.users.reduce((count, user) => count + user.files.length, 0);
    });

    res.json({
      success: true,
      data: banks,
      count: banks.length,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



router.delete("/deletebanks/:bank_id", async (req, res) => {
  try {
    const bankId = req.params.bank_id;
    const bankUser = await BankUser.findOne({ bank_id: bankId });

    if (bankUser) {
      return res.status(200).json({
        statusCode: 201,
        message: "Cannot delete the branch because it is assigned",
      });
    }

    await Bank.deleteOne({ bank_id: bankId });

    res.json({
      success: true,
      message: "Bank deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/:bank_id", async (req, res) => {
  const { bank_id } = req.params;
  const updates = req.body;

  try {
    // Ensure only valid fields are updated
    const allowedUpdates = [
      "bank_name",
      "country",
      "state_code",
      "country_code",
      "state",
      "city",
      "branch_name",
    ];
    const updatesKeys = Object.keys(updates);
    const isValidOperation = updatesKeys.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: "Invalid updates!",
      });
    }

    // Update bank details in the Bank collection
    const updatedBank = await Bank.findOneAndUpdate(
      { bank_id: bank_id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedBank) {
      return res.status(404).json({
        success: false,
        message: "Bank not found",
      });
    }

    // Send response with updated bank data
    res.json({
      success: true,
      message: "Bank data updated successfully",
      updatedBank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message, // Optionally send the error message for debugging
    });
  }
});

router.get("/get_branch/:city/:bank_name", async (req, res) => {
  try {
    const bank_name = req.params.bank_name;
    const city = req.params.city;
    const data = await Bank.find({ bank_name, city }).select(
      "-_id bank_id bank_name branch_name"
    );
    res.json({
      success: true,
      data,
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
