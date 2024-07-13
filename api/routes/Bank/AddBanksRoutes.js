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
    ]);

    for (let i = 0; i < banks.length; i++) {
      const bank_id = banks[i].bank_id;

      const bankUserCount = await BankUser.countDocuments({ bank_id });
      banks[i].user_count = bankUserCount;

      let totalFileCount = 0; // Initialize file count for each bank

      const bankUsers = await BankUser.find({ bank_id });

      for (let j = 0; j < bankUsers.length; j++) {
        const bankuser_id = bankUsers[j].bankuser_id;

        const assignedFiles = await BankApproval.find({ bankuser_id });

        totalFileCount += assignedFiles.length; // Increment the file count

        for (let k = 0; k < assignedFiles.length; k++) {
          const file_id = assignedFiles[k].file_id;
          let fileDetails = await File_Uplode.findOne({
            file_id: file_id,
          }).lean();

          if (fileDetails) {
            const loanStatusDetails = await LoanStatus.findOne({
              loanstatus_id: fileDetails.status,
            }).lean();

            if (loanStatusDetails) {
              fileDetails.status = loanStatusDetails.loanstatus;
              fileDetails.status_color = loanStatusDetails.color;
            }

            const userDetails = await AddUser.findOne({
              user_id: fileDetails.user_id,
            }).lean();

            if (userDetails) {
              fileDetails.user_details = userDetails;
            }
            // Fetch loan details using loan_id
            const loanDetails = await Loan.findOne({
              loan_id: fileDetails.loan_id,
            }).lean();

            if (loanDetails) {
              fileDetails.loan_details = loanDetails;
            }
          }

          assignedFiles[k] = {
            ...assignedFiles[k].toObject(),
            file_details: fileDetails,
          };
        }

        bankUsers[j] = bankUsers[j].toObject();
        bankUsers[j].files = assignedFiles;
      }

      banks[i].users = bankUsers;
      banks[i].file_count = totalFileCount; // Assign the file count to the bank
    }

    const count = banks.length;

    res.json({
      success: true,
      data: banks,
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
