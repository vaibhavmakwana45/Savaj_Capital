const express = require("express");
const router = express.Router();
const moment = require("moment");
const Bank = require("../models/BankSchema");
const User = require("../models/BankUserSchema");
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

const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

router.post("/addbankuser", async (req, res) => {
  try {
    const { bankDetails, userDetails } = req.body;
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, "0");
    const bankId = `${timestamp}${randomString}${randomNumber}`;

    const existingUser = await User.findOne({ email: userDetails.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    let bank = await Bank.findOne({ branch_name: bankDetails.branch_name });
    if (!bank) {
      bank = new Bank({
        ...bankDetails,
        bank_id: bankId,
        createdAt: currentDate,
        updatedAt: currentDate,
      });
      await bank.save();
    }
    const hashedPassword = encrypt(userDetails.password);

    const newUser = new User({
      ...userDetails,
      bankuser_id: `${timestamp}${randomString}${randomNumber}`,
      bank_id: bank.bank_id,
      createdAt: currentDate,
      updatedAt: currentDate,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User and Bank data saved successfully",
      data: { user: newUser, bank: bank },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/bankuserlogin", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ${
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? "email" : "username"
        } '${identifier}' does not exist`,
      });
    }

    const decryptedPassword = decrypt(user.password);

    if (password !== decryptedPassword) {
      return res.status(422).json({ message: "Old password is incorrect." });
    }

    const { token, expiresIn } = await createToken(user);

    res.json({
      success: true,
      data: user,
      expiresAt: expiresIn,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

router.get("/banks", async (req, res) => {
  try {
    const banks = await Bank.find();

    const bankUsersPromises = banks.map(async (bank) => {
      const users = await User.find({ bank_id: bank.bank_id });
      return { ...bank._doc, users };
    });

    const banksWithUsers = await Promise.all(bankUsersPromises);

    res.json({
      success: true,
      data: banksWithUsers,
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
