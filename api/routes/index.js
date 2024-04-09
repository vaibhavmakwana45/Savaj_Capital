var express = require("express");
var router = express.Router();
const moment = require("moment");
const SuperAdminSignup = require("../models/SuperAdminSignupSchema");
const BankUser = require("../models/BankUserSchema");
const AddUser = require("../models/AddUser");
const SavajCapital_User = require("../models/Savaj_Capital/SavajCapital_User");
const {
  bankUserToken,
  superAdminToken,
  savajCapitalUserToken,
  userToken,
} = require("../utils/authhelper");

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

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/login", async (req, res) => {
  try {
    const user = await AddUser.findOne({ email: req.body.email });
    const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdminSignup.findOne({
      email: req.body.email,
    });
    const savajCapitalUser = await SavajCapital_User.findOne({
      email: req.body.email,
    });

    if (!bankUser && !superAdmin && savajCapitalUser && user) {
      return res
        .status(201)
        .send({ statusCode: 201, message: "User doesn't exist" });
    }

    let token, expiresIn, userForToken, role;
    if (bankUser) {
      const decryptedPassword = decrypt(bankUser.password);
      if (req.body.password !== decryptedPassword) {
        return res
          .status(201)
          .send({ statusCode: 202, message: "Password is incorrect." });
      }
      userForToken = bankUser;
      role = "bankuser";
      ({ token, expiresIn } = await bankUserToken(userForToken));
    } else if (superAdmin) {
      userForToken = superAdmin;
      role = "superadmin";
      ({ token, expiresIn } = await superAdminToken(userForToken));
    } else if (savajCapitalUser) {
      userForToken = savajCapitalUser;
      role = "savajcapitaluser";
      ({ token, expiresIn } = await savajCapitalUserToken(userForToken));
    } else if (user) {
      userForToken = user;
      role = "user";
      ({ token, expiresIn } = await userToken(userForToken));
    }

    res.json({
      success: true,
      data: userForToken,
      role: role,
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

module.exports = router;
