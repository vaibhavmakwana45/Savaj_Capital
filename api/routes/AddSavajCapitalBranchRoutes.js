const express = require("express");
const router = express.Router();
const moment = require("moment");
const SavajCapitalBranch = require("../models/SavajCapitalBranch");
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

router.post("/addsavajcapitalbranch", async (req, res) => {
  try {
    const { savajCapitalBranchDetails, savajCapitalUserDetails } = req.body;
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, "0");
    const savajCapitalBranchId = `${timestamp}${randomString}${randomNumber}`;

    const user = await AddUser.findOne({
      email: savajCapitalUserDetails.email,
    });
    const bankUser = await BankUser.findOne({
      email: savajCapitalUserDetails.email,
    });
    const superAdmin = await SuperAdmin.findOne({
      email: savajCapitalUserDetails.email,
    });
    const savajCapitalUser = await SavajCapitalUser.findOne({
      email: savajCapitalUserDetails.email,
    });

    if (bankUser || superAdmin || user || savajCapitalUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    let savajCapitalBranch = await SavajCapitalBranch.findOne({
      savajcapitalbranch_name:
        savajCapitalBranchDetails.savajcapitalbranch_name,
    });

    if (!savajCapitalBranch) {
      savajCapitalBranch = new SavajCapitalBranch({
        ...savajCapitalBranchDetails,
        savajcapitalbranch_id: savajCapitalBranchId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await savajCapitalBranch.save();
    }

    const hashedPassword = encrypt(savajCapitalUserDetails.password);

    const newUser = new SavajCapitalUser({
      ...savajCapitalUserDetails,
      savajcapitaluser_id: `${timestamp}${randomString}${randomNumber}`,
      savajcapitalbranch_id: savajCapitalBranch.savajcapitalbranch_id,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: hashedPassword,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User and Branch data saved successfully",
      data: {
        savajCapitalUser: newUser,
        savajCapitalBranch: savajCapitalBranch,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});
router.post("/savajcapitalbranchlogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await SavajCapitalUser.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with email '${email}' does not exist`,
      });
    }

    const decryptedPassword = decrypt(user.password);

    if (password !== decryptedPassword) {
      return res.status(422).json({ message: "Password is incorrect." });
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

router.get("/allsavajcapitalbranch", async (req, res) => {
  try {
    const savajcapitalbranch = await SavajCapitalBranch.find();

    const bankUsersPromises = savajcapitalbranch.map(
      async (savajcapitalbranch) => {
        const users = await SavajCapitalUser.find({
          savajcapitalbranch_id: savajcapitalbranch.savajcapitalbranch_id,
        });
        return { ...savajcapitalbranch._doc, users };
      }
    );

    const SavajcapitalbranchWithUsers = await Promise.all(bankUsersPromises);

    res.json({
      success: true,
      data: SavajcapitalbranchWithUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/deletebranch/:savajcapitalbranch_id", async (req, res) => {
  try {
    const branchId = req.params.savajcapitalbranch_id;
    const branch = await SavajCapitalBranch.findOne({ savajcapitalbranch_id : branchId });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Bank not found",
      });
    }

    await SavajCapitalBranch.deleteOne({ savajcapitalbranch_id: branchId });

    await SavajCapitalUser.deleteOne({ savajcapitalbranch_id: branchId });

    res.json({
      success: true,
      message: "Branch and associated users deleted successfully",
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
