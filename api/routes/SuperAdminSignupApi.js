const express = require("express");
const router = express.Router();
const moment = require("moment");
const SuperAdminSignup = require("../models/SuperAdminSignupSchema");
const { superAdminToken } = require("../utils/authhelper");
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

router.post("/superadminsignup", async (req, res) => {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(5, 15);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, "0");
    const uniqueId = `${timestamp}${randomString}${randomNumber}`;

    const superAdminUniqueId = (req.body["superadmin_id"] = uniqueId);
    const createTime = (req.body["createAt"] = moment().format(
      "YYYY-MM-DD HH:mm:ss"
    ));
    const updateTime = (req.body["updateAt"] = moment().format(
      "YYYY-MM-DD HH:mm:ss"
    ));
    const hashedPassword = encrypt(req.body.password);

    const newUser = new SuperAdminSignup({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      password: hashedPassword,
      createAt: createTime,
      updateAt: updateTime,
      superadmin_id: superAdminUniqueId,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Admin SignUp Successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/superadminlogin", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await SuperAdminSignup.findOne({
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

    const { token, expiresIn } = await superAdminToken(user);

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

router.put("/superadminchangepassword/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await SuperAdminSignup.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const compare = await hashCompare(oldPassword, user.password);

    if (!compare) {
      return res.status(422).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    user.updateAt = moment().format("YYYY-MM-DD HH:mm:ss");

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
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
