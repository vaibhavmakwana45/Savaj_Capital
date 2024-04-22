const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddUser = require("../models/AddUser");
const BankUser = require("../models/Bank/BankUserSchema");
const BankSchema = require("../models/Bank/BankSchema");
const SuperAdmin = require("../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../models/Savaj_Capital/SavajCapital_User");
const { createToken } = require("../utils/authhelper");
const crypto = require("crypto");
const axios = require("axios");

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

router.post("/adduser", async (req, res) => {
  console.log("first", req.body);
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

    // const hashedPassword = encrypt(userDetails.password);

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
      password: "",
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

    if (bankUser || superAdmin || user || savajCapital_user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    // const hashedPassword = encrypt(userDetails.password);

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
      password: "",
    });

    await newUser.save();
    const ApiResponse = await axios.post(
      `https://admin.savajcapital.com/api/setpassword/passwordmail`,
      {
        email: req.body.email,
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

router.get("/getusers", async (req, res) => {
  try {
    const users = await AddUser.find({}, "-password");
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
    const { userId } = req.params;

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
    // if (updates.password) {
    //   updates.password = await hashPassword(updates.password);
    // }

    const updatedUser = await AddUser.findOneAndUpdate(
      { user_id: userId },
      updates,
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
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

module.exports = router;
