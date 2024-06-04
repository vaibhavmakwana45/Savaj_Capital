const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddUser = require("../models/AddUser");
const BankUser = require("../models/Bank/BankUserSchema");
const BankSchema = require("../models/Bank/BankSchema");
const SuperAdmin = require("../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../models/Savaj_Capital/SavajCapital_User");
const File_Uplode = require("../models/File/File_Uplode");
const { createToken } = require("../utils/authhelper");
const crypto = require("crypto");
const axios = require("axios");
const Loan = require("../models/Loan/Loan");
const Loan_Type = require("../models/Loan/Loan_Type");
// const Loan_Documents = require("../../models/Loan/Loan_Documents");

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
    return text;
  }
};

const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

router.post("/adduser", async (req, res) => {
  try {
    const { userDetails } = req.body;

    const user = await AddUser.findOne({ email: userDetails.email });
    const bankUser = await BankUser.findOne({ email: userDetails.email });
    const superAdmin = await SuperAdmin.findOne({ email: userDetails.email });
    const savajCapital_user = await SavajCapital_User.findOne({
      email: userDetails.email,
    });

    if (bankUser || superAdmin || user || savajCapital_user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    const hashedPassword = encrypt(userDetails.password);

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, "0");
    const userId = `${timestamp}${randomString}${randomNumber}`;

    const newUser = new AddUser({
      ...userDetails,
      user_id: userId,
      createdAt: currentDate,
      updatedAt: currentDate,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User added successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/adduserbyadmin", async (req, res) => {
  try {
    const { userDetails } = req.body;

    const user = await AddUser.findOne({ email: userDetails.email });
    const bankUser = await BankUser.findOne({ email: userDetails.email });
    const superAdmin = await SuperAdmin.findOne({ email: userDetails.email });
    const savajCapital_user = await SavajCapital_User.findOne({
      email: userDetails.email,
    });

    const userNumberExists = await AddUser.findOne({
      number: userDetails.number,
    });

    let findMobileNumber = await SavajCapital_User.findOne({
      number: userDetails.number,
    });

    const userAdharExists = await AddUser.findOne({
      aadhar_card: userDetails.aadhar_card,
    });

    const userPanExists = await AddUser.findOne({
      pan_card: userDetails.pan_card,
    });

    const numberExistsInBankUser = await BankUser.findOne({
      mobile: userDetails.number,
    });

    if (bankUser || superAdmin || user || savajCapital_user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    if (userNumberExists || numberExistsInBankUser || findMobileNumber) {
      return res
        .status(200)
        .send({ statusCode: 204, message: "Mobile number already in use" });
    }

    if (userPanExists) {
      return res
        .status(200)
        .send({ statusCode: 203, message: "Pan Card already in use" });
    }

    if (userAdharExists) {
      return res
        .status(200)
        .send({ statusCode: 202, message: "Aadhar Card already in use" });
    }

    const hashedPassword = encrypt(userDetails.password);
    const status = req.body.cibil_score === "" ? "active" : "complete";
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, "0");
    const userId = `${timestamp}${randomString}${randomNumber}`;

    const newUser = new AddUser({
      ...userDetails,
      user_id: userId,
      createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      // password: "",
      password: hashedPassword,
      status: status,
    });

    await newUser.save();
    const ApiResponse = await axios.post(
      `https://admin.savajcapital.com/api/setpassword/passwordmail`,
      {
        email: req.body.userDetails.email,
      }
    );

    if (ApiResponse.status === 200) {
      res.json({
        success: true,
        message: "User added successfully",
        data: newUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/getallusers", async (req, res) => {
  try {
    const users = await AddUser.find({}, "-password").sort({ updatedAt: -1 });
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
router.get("/getusers", async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const dataPerPage = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm;

    const matchStage = {};

    if (searchTerm) {
      matchStage.$or = [
        { username: { $regex: new RegExp(searchTerm, "i") } },
        { businessname: { $regex: new RegExp(searchTerm, "i") } },
        { email: { $regex: new RegExp(searchTerm, "i") } },
        { number: { $regex: new RegExp(searchTerm, "i") } },
        { pan_card: { $regex: new RegExp(searchTerm, "i") } },
        { aadhar_card: parseInt(searchTerm) || -1 },
      ];
    }

    const selectedState = req.query.selectedState || "";
    if (selectedState) {
      matchStage.state = selectedState;
    }

    const selectedCity = req.query.selectedCity || "";
    if (selectedCity) {
      matchStage.city = selectedCity;
    }

    const totalDataCount = await AddUser.countDocuments(matchStage);
    const pipeline = [
      { $match: matchStage },
      { $sort: { updatedAt: -1 } },
      { $skip: (currentPage - 1) * dataPerPage },
      { $limit: dataPerPage },
    ];

    const data = await AddUser.aggregate(pipeline);

    res.json({
      statusCode: 200,
      data,
      totalPages: Math.ceil(totalDataCount / dataPerPage),
      currentPage,
      totalCount: totalDataCount,
      message: "Read All Request",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/getcustomers/:state/:city", async (req, res) => {
  const { state, city } = req.params;

  try {
    const users = await AddUser.find({ state, city }, "-password").sort({
      updatedAt: -1,
    });
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Paination
// router.get("/getusers", async (req, res) => {
//   try {
//     // Pagination parameters
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10; // Default limit is 10

//     // Fetch users with pagination and excluding password field
//     const users = await AddUser.find({}, "-password")
//       .sort({ updatedAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     // Count total users
//     const totalUsers = await AddUser.countDocuments();

//     // Calculate total pages
//     const totalPages = Math.ceil(totalUsers / limit);

//     res.json({
//       success: true,
//       users,
//       pagination: {
//         count: users.length,
//         totalPages,
//         currentPage: page,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// });

// router.post("/search", async (req, res) => {
//   try {
//     const searchValue = req.body.search;

//     if (!searchValue) {
//       return res.status(400).json({ statusCode: 400, message: "Search parameter is required." });
//     }

//     const regexSearch = new RegExp(searchValue, "i");

//     const searchCriteria = [
//       { username: regexSearch },
//       { email: regexSearch },
//       { businessname: regexSearch },
//       { number: regexSearch },
//       { cibil_score: regexSearch },
//       { unit_address: regexSearch },
//       { reference: regexSearch },
//       { gst_number: regexSearch },
//       { state: regexSearch },
//       { city: regexSearch },
//       { pan_card: regexSearch },
//     ];

//     // Check if the search value is a valid number
//     const searchValueAsNumber = parseInt(searchValue);
//     if (!isNaN(searchValueAsNumber)) {
//       // If valid, include aadhar_card field in search criteria
//       searchCriteria.push({ aadhar_card: searchValueAsNumber });
//     }

//     const data = await AddUser.find({ $or: searchCriteria });
//     const count = await AddUser.countDocuments({ $or: searchCriteria });

//     res.json({
//       statusCode: 200,
//       data: data,
//       count: count,
//       message: "Category Read Successful",
//     });
//   } catch (error) {
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message || "An error occurred while searching.",
//     });
//   }
// });

router.get("/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const user = await AddUser.findOne({ user_id });

    if (!user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/deleteuser/:userId", async (req, res) => {
  try {
    // const { userId } = req.params;
    const userId = req.params.userId;

    const user = await File_Uplode.findOne({ user_id: userId });

    if (user) {
      return res.status(200).send({
        statusCode: 201,
        message: "Loan application detected. Delete not allowed.",
      });
    }

    const deletedUser = await AddUser.findOneAndDelete({ user_id: userId });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedUserId: userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// User Edit Api
router.put("/edituser/:userId", async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    const status =
      req.body.cibil_score && req.body.cibil_score !== ""
        ? "complete"
        : "active";

    if (req.body.password && req.body.password.trim() !== "") {
      const hashedPassword = encrypt(req.body.password);
      req.body.password = hashedPassword;
    } else {
      delete req.body.password;
    }

    const updatedUser = await AddUser.findOneAndUpdate(
      { user_id: userId },
      { ...updates, status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User data updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
});

router.get("/bankuser/:bank_id", async (req, res) => {
  try {
    const bank_id = req.params.bank_id;
    const bankUser = await BankUser.findOne({ bank_id });
    const bankData = await BankSchema.findOne({ bank_id });

    if (!bankUser) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "User not found" });
    }

    const bankDetails = {
      bank_name: bankData.bank_name,
      country: bankData.country,
      state_code: bankData.state_code,
      country_code: bankData.country_code,
      state: bankData.state,
      city: bankData.city,
      branch_name: bankData.branch_name,
      bank_id: bankData.bank_id,
    };

    const userDetails = {
      email: bankUser.email,
      password: bankUser.password,
      bankuser_id: bankUser.bankuser_id,
      bank_id: bankUser.bank_id,
    };

    res.json({
      success: true,
      bankDetails,
      userDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/user/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const user = await AddUser.findOne({ user_id });

    if (!user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "User not found" });
    }

    const passwordDecrypt = decrypt(user?.password);
    user.password = passwordDecrypt;

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/bankuser/by-user-id/:bankuser_id", async (req, res) => {
  try {
    const bankuser_id = req.params.bankuser_id;

    const bankUser = await BankUser.findOne({ bankuser_id });

    if (!bankUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const bankData = await BankSchema.findOne({ bank_id: bankUser.bank_id });

    if (!bankData) {
      return res.status(404).json({
        success: false,
        message: "Bank details not found",
      });
    }

    const passwordDecrypt = decrypt(bankUser?.password);

    const bankDetails = {
      bank_name: bankData.bank_name,
      country: bankData.country,
      state_code: bankData.state_code,
      country_code: bankData.country_code,
      state: bankData.state,
      city: bankData.city,
      branch_name: bankData.branch_name,
      bank_id: bankData.bank_id,
    };

    const userDetails = {
      bankuser_name: bankUser.bankuser_name,
      email: bankUser.email,
      password: passwordDecrypt,
      bankuser_id: bankUser.bankuser_id,
      bank_id: bankUser.bank_id,
      adress: bankUser.adress,
      dob: bankUser.dob,
      mobile: bankUser.mobile,
      adhar: bankUser.adhar,
      emergancy_contact: bankUser.emergancy_contact,
    };

    res.json({
      success: true,
      bankDetails,
      userDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/customer/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;

    // Fetch user data just once
    const user_data = await AddUser.findOne({ user_id: user_id });
    const username = user_data ? user_data.username : null; // Assuming 'username' is the field name

    // Continue with the file upload data aggregation
    var data = await File_Uplode.aggregate([
      {
        $match: { user_id: user_id },
      },
    ]);

    // Process each file upload data for additional details
    for (let i = 0; i < data.length; i++) {
      const loan_id = data[i].loan_id;
      const loantype_id = data[i].loantype_id;

      if (loan_id) {
        const loan_data = await Loan.findOne({ loan_id: loan_id });
        if (loan_data) {
          data[i].loan = loan_data.loan;
        }
      }

      if (loantype_id) {
        const loan_type_data = await Loan_Type.findOne({
          loantype_id: loantype_id,
        });
        if (loan_type_data) {
          data[i].loan_type = loan_type_data.loan_type;
        }
      }
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      username: username, // Return username directly here
      count: count,
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.put("/toggle-active/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { isActivate } = req.body;

  try {
    if (typeof isActivate !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid input for isActivate. Must be boolean.",
      });
    }

    const updatedUser = await AddUser.findOneAndUpdate(
      { user_id: user_id },
      { isActivate: isActivate },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User activation status updated successfully",
      user: updatedUser,
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
