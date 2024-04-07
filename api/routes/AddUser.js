const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddUser = require("../models/AddUser");
const BankUser = require("../models/BankUserSchema");
const SuperAdmin = require("../models/SuperAdminSignupSchema");
const SavajCapitalUser = require("../models/SavajCapitalUser");
const { createToken } = require("../utils/authhelper");
const crypto = require("crypto");

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

router.post("/adduser", async (req, res) => {
  try {
    const { userDetails } = req.body;

    const user = await AddUser.findOne({ email: userDetails.email });
    const bankUser = await BankUser.findOne({ email: userDetails.email });
    const superAdmin = await SuperAdmin.findOne({ email: userDetails.email });
    const savajCapitalUser = await SavajCapitalUser.findOne({
      email: userDetails.email,
    });

    if (bankUser || superAdmin || user || savajCapitalUser) {
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
      createdAt: new Date(),
      updatedAt: new Date(),
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

router.put("/edituser/:userId", async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

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
      admin: updatedUser,
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
