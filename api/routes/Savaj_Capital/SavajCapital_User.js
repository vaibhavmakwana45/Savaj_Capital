const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddUser = require("../../models/AddUser");
const BankUser = require("../../models/Bank/BankUserSchema");
const SuperAdmin = require("../../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const SavajCapital_Role = require("../../models/Savaj_Capital/SavajCapital_Role");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const File_Uplode = require("../../models/File/File_Uplode");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const crypto = require("crypto");
const axios = require("axios");
const Branch_Assign = require("../../models/Savaj_Capital/Branch_Assign");

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
    let findEmail = await SavajCapital_User.findOne({
      email: req.body.email,
    });

    let findMobileNumber = await SavajCapital_User.findOne({
      number: req.body.number,
    });

    const numberExistsInBankUser = await BankUser.findOne({
      mobile: req.body.number,
    });

    const userNumberExists = await AddUser.findOne({
      number: req.body.number,
    });

    const user = await AddUser.findOne({ email: req.body.email });
    const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (findEmail || bankUser || superAdmin || user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    if (findMobileNumber || numberExistsInBankUser || userNumberExists) {
      return res
        .status(200)
        .send({ statusCode: 202, message: "Mobile number already in use" });
    }

    // if (!findEmail || !user || !bankUser || !superAdmin) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    const hashedPassword = encrypt(req.body.password);

    req.body["branchuser_id"] = uniqueId;
    req.body["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["password"] = hashedPassword;

    var data = await SavajCapital_User.create(req.body);

    const ApiResponse = await axios.post(
      `https://admin.savajcapital.com/api/setpassword/passwordmail`,
      {
        email: req.body.email,
      }
    );

    if (ApiResponse.status === 200) {
      res.json({
        success: true,
        data: data,
        message: "Add Branch-User Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/:branch_id", async (req, res) => {
  try {
    const branch_id = req.params.branch_id;

    var data = await SavajCapital_User.aggregate([
      {
        $match: { branch_id: branch_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    const branch = await SavajCapital_Branch.findOne({ branch_id });

    for (let i = 0; i < data.length; i++) {
      const role_id = data[i].role_id;

      const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });

      if (branch_data) {
        data[i].role = branch_data.role;
      }
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      branch,
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

router.put("/:branchuser_id", async (req, res) => {
  try {
    const { branchuser_id } = req.params;

    // Ensure that updatedAt field is set
    const hashedPassword = encrypt(req.body.password);
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    req.body.password = hashedPassword;

    // if (!req.body.password) {
    //   delete req.body.password;
    // }
    const result = await SavajCapital_User.findOneAndUpdate(
      { branchuser_id: branchuser_id },
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

router.delete("/:branchuser_id", async (req, res) => {
  try {
    const { branchuser_id } = req.params;

    const savajUserExistsInSavajBranchAssign = await Branch_Assign.findOne({
      branchuser_id: branchuser_id,
    });

    if (savajUserExistsInSavajBranchAssign) {
      return res.status(200).json({
        statusCode: 201,
        message:
          "Branch user cannot be deleted because it is currently assigned.",
      });
    }

    const deletedUser = await SavajCapital_User.findOneAndDelete({
      branchuser_id: branchuser_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 201,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedRoleId: branchuser_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/user/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;

    var data = await SavajCapital_User.aggregate([
      {
        $match: { branchuser_id: branchuser_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    // const hashedPassword = decrypt(data[0]?.password);

    for (let i = 0; i < data.length; i++) {
      const decryptedPassword = decrypt(data[i]?.password);
      data[i].password = decryptedPassword;
    }

    const branch = await SavajCapital_Branch.findOne({
      branchuser_id: data.branchuser_id,
    });

    for (let i = 0; i < data.length; i++) {
      const role_id = data[i].role_id;

      const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });

      if (branch_data) {
        data[i].role = branch_data.role;
      }
    }

    const count = data.length;

    res.json({
      success: true,
      branch,
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

// router.get("/assigned_file/:branchuser_id", async (req, res) => {
//   try {
//     const branchuser_id = req.params.branchuser_id;

//     const data = await File_Uplode.aggregate([
//       {
//         $match: { branchuser_id: branchuser_id },
//       },
//       {
//         $sort: { updatedAt: -1 },
//       },
//     ]);

//     const savajUserData = await SavajCapital_User.findOne({branchuser_id: branchuser_id})

//     for (let i = 0; i < data.length; i++) {
//       const loan_id = data[i]?.loan_id;
//       const loantype_id = data[i]?.loantype_id;
//       const user_id = data[i]?.user_id;

//       const loanData = await Loan.findOne({
//         loan_id: loan_id,
//       });

//       const loanTypeData = await Loan_Type.findOne({
//         loantype_id: loantype_id,
//       });

//       const userData = await AddUser.findOne({ user_id: user_id });

//       if (loanData) {
//         data[i].loan = loanData.loan;
//       }

//       if (loanTypeData) {
//         data[i].loan_type = loanTypeData.loan_type;
//       }

//       if(userData){
//         data[i].username = userData.username
//       }
//     }

//     const count = data.length;

//     res.json({
//       // statusCode: 200,
//       success: true,
//       savajUserData,
//       data: data,
//       count: count,
//       message: "Read All Request",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });
router.get("/assigned_file/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;

    const branchAssign = await Branch_Assign.find({
      branchuser_id: branchuser_id,
    }).sort({ updatedAt: -1 });

    if (!branchAssign || branchAssign.length === 0) {
      return res.json({
        success: false,
        message: "No branch assign found for the specified branch user.",
        data: [],
      });
    }
    const branchUserData = await SavajCapital_User.findOne({
      branchuser_id: branchuser_id,
    });

    const fileIds = branchAssign.map((approval) => approval.file_id);

    const fileDetails = await File_Uplode.find({ file_id: { $in: fileIds } });

    const augmentedData = await Promise.all(
      branchAssign.map(async (approval) => {
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
    

        return entry;
      })
    );

    res.json({
      success: true,
      data: augmentedData,
      count: augmentedData.length,
      branchUserData: branchUserData,
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

    const deletedUser = await Branch_Assign.findOneAndDelete({
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
