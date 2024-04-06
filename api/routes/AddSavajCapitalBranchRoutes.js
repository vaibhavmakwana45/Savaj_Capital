const express = require("express");
const router = express.Router();
const moment = require("moment");
const SavajCapitalBranch = require("../models/SavajCapitalBranch");
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

    const existingUser = await SavajCapitalUser.findOne({
      email: savajCapitalUserDetails.email,
    });

    if (existingUser) {
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

router.get("/savajcapitalbranch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const savajcapitalbranch = await SavajCapitalBranch.findOne({
      savajcapitalbranch_id: id,
    });

    if (!savajcapitalbranch) {
      return res.status(404).json({
        success: false,
        message: "Savaj Capital Branch not found",
      });
    }

    const users = await SavajCapitalUser.find({
      savajcapitalbranch_id: id,
    });

    const savajcapitalbranchWithUsers = { ...savajcapitalbranch._doc, users };

    res.json({
      success: true,
      data: savajcapitalbranchWithUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/savajcapitalbranch/:id", async (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const { branchData, userData } = req.body;

  try {
    const updatedBranch = await SavajCapitalBranch.findOneAndUpdate(
      { savajcapitalbranch_id: id },
      { $set: branchData },
      { new: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: "Savaj Capital Branch not found",
      });
    }

    const userUpdates = userData.map((user) => {
      return SavajCapitalUser.findOneAndUpdate(
        { email: user.email, savajcapitalbranch_id: id },
        { $set: user },
        { new: true }
      );
    });

    const updatedUsers = await Promise.all(userUpdates);

    res.json({
      success: true,
      message: "Branch and Users updated successfully",
      data: {
        updatedBranch,
        updatedUsers, // Note that this is now an array of updated users
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

module.exports = router;
