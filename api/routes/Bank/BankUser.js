const express = require("express");
const router = express.Router();
const moment = require("moment");
const Bank = require("../../models/Bank/BankSchema");
const BankUser = require("../../models/Bank/BankUserSchema");
const AddUser = require("../../models/AddUser");
const SuperAdmin = require("../../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const { createToken } = require("../../utils/authhelper");
const crypto = require("crypto");
const axios = require("axios");
const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
const BankApproval = require("../../models/Bank/BankApproval");
const File_Uplode = require("../../models/File/File_Uplode");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "vaibhav");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// const decrypt = (text) => {
//   const decipher = crypto.createDecipher("aes-256-cbc", "vaibhav");
//   let decrypted = decipher.update(text, "hex", "utf-8");
//   decrypted += decipher.final("utf-8");
//   return decrypted;
// };

const decrypt = (text) => {
  // Check if the text contains hexadecimal characters (indicative of encryption)
  const isEncrypted = /[0-9A-Fa-f]{6}/.test(text);

  // If the text is encrypted, decrypt it
  if (isEncrypted) {
    const decipher = crypto.createDecipher("aes-256-cbc", "vaibhav");
    let decrypted = decipher.update(text, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } else {
    // If the text is not encrypted, return it as is
    return text;
  }
};

router.post("/", async (req, res) => {
  try {
    let savajUser = await SavajCapital_User.findOne({
      email: req.body.email,
    });

    const user = await AddUser.findOne({ email: req.body.email });
    const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (savajUser || user || bankUser || superAdmin) {
      res.json({
        statusCode: 201,
        message: `${req.body.branch_name} Name Already Added`,
      });
    }
    // Number find in savaj-capital user
    let findMobileNumber = await SavajCapital_User.findOne({
      number: req.body.mobile,
    });

    // Number find in Bank user
    const numberExistsInBankUser = await BankUser.findOne({
      mobile: req.body.mobile,
    });

    // Number find in Add user
    const userNumberExists = await AddUser.findOne({
      number: req.body.mobile,
    });

    if (numberExistsInBankUser || userNumberExists || findMobileNumber) {
      return res
        .status(200)
        .send({ statusCode: 202, message: "Mobile number already in use" });
    }

    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    const hashedPassword = encrypt(req.body.password);
    req.body["bankuser_id"] = uniqueId;
    req.body["createdAt"] = currentDate;
    req.body["updatedAt"] = currentDate;
    req.body["password"] = hashedPassword;

    var data = await BankUser.create(req.body);
    const ApiResponse = await axios.post(
      `http://localhost:5882/api/setpassword/passwordmail`,
      {
        email: req.body.email,
      }
    );

    if (ApiResponse.status === 200) {
      res.json({
        success: true,
        data: data,
        message: "Add Branch Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Bank Delete
router.delete("/:bank_id", async (req, res) => {
  try {
    const { bank_id } = req.params;

    const bankExistsInBankUser = await BankUser.findOne({ bank_id: bank_id });
    const bankExistsInBankApproval = await BankApproval.findOne({
      bank_id: bank_id,
    });

    if (bankExistsInBankUser || bankExistsInBankApproval) {
      return res.status(200).json({
        statusCode: 201,
        message: "Bank cannot be deleted because it is currently assigned.",
      });
    }

    const deletedUser = await Bank.findOneAndDelete({
      bank_id: bank_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 202,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedBankId: bank_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/:bankuser_id", async (req, res) => {
  try {
    const { bankuser_id } = req.params;
    let findEmail = await SavajCapital_User.findOne({
      email: req.body.email,
    });
    const user = await AddUser.findOne({ email: req.body.email });
    //   const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (findEmail || superAdmin || user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    const hashedPassword = encrypt(req.body.password);
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    req.body.password = hashedPassword
    // if (!req.body.password) {
    //   delete req.body.password;
    // }
    const result = await BankUser.findOneAndUpdate(
      { bankuser_id: bankuser_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Branch-User Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Branch-User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/:bank_id", async (req, res) => {
  try {
    const bank_id = req.params.bank_id;

    var data = await BankUser.aggregate([
      {
        $match: { bank_id: bank_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    const bank = await Bank.findOne({
      bank_id: bank_id,
    });

    const count = data.length;

    res.json({
      success: true,
      bank,
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

// Bank User Delete
router.delete("/deletebankuser/:bankId", async (req, res) => {
  try {
    const { bankId } = req.params;

    const bankUserExistsInBankApproval = await BankApproval.findOne({
      bankuser_id: bankId,
    });

    if (bankUserExistsInBankApproval) {
      return res.status(200).json({
        statusCode: 201,
        message:
          "Bank-user cannot be deleted because it is currently assigned.",
      });
    }

    const deletedBankUser = await BankUser.findOneAndDelete({
      bankuser_id: bankId,
    });

    if (!deletedBankUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      message: "Bank User deleted successfully",
      deletedBankUserId: bankId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/assigned_file/:bankuser_id", async (req, res) => {
  try {
    const bankuser_id = req.params.bankuser_id;

    const bankApprovals = await BankApproval.find({
      bankuser_id: bankuser_id,
    }).sort({ updatedAt: -1 });

    if (!bankApprovals || bankApprovals.length === 0) {
      return res.json({
        success: false,
        message: "No bank approvals found for the specified bank user.",
        data: [],
      });
    }
    const bankUserData = await BankUser.findOne({ bankuser_id: bankuser_id });

    const fileIds = bankApprovals.map((approval) => approval.file_id);

    const fileDetails = await File_Uplode.find({ file_id: { $in: fileIds } });

    const augmentedData = await Promise.all(
      bankApprovals.map(async (approval) => {
        const fileData = fileDetails.find(
          (detail) => detail.file_id === approval.file_id
        );
        if (!fileData) return null;

        const loanData = await Loan.findOne({ loan_id: fileData.loan_id });
        const loanTypeData = await Loan_Type.findOne({
          loantype_id: fileData.loantype_id,
        });
        const userData = await AddUser.findOne({ user_id: fileData.user_id });

        const entry = {
          ...approval.toObject(),
          file_data: fileData,
          loan: loanData ? loanData.loan : null,
          loan_type: loanTypeData ? loanTypeData.loan_type : null,
          username: userData ? userData.username : null,
        };

        const hasMissingDetail =
          !fileData || !loanData || !loanTypeData || !userData;
        if (hasMissingDetail) {
          console.log(
            "Missing detail for BankApproval with file_id:",
            approval.file_id
          );
          console.log("File data:", fileData);
          console.log("Loan data:", loanData);
          console.log("Loan type data:", loanTypeData);
          console.log("User data:", userData);
        }

        return entry;
      })
    );

    res.json({
      success: true,
      data: augmentedData,
      count: augmentedData.length,
      bankUserData: bankUserData,
      message: "Bank approvals data with all details retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/assigedfile_delete/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    const deletedUser = await BankApproval.findOneAndDelete({
      file_id: file_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 202,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "File successfully deleted.",
      deletedBankId: file_id,
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
