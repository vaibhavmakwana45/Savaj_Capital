var express = require("express");
var router = express.Router();
const moment = require("moment");
const SuperAdminSignup = require("../models/SuperAdminSignupSchema");
const BankUser = require("../models/Bank/BankUserSchema");
const AddUser = require("../models/AddUser");
const SavajCapital_User = require("../models/Savaj_Capital/SavajCapital_User");
const {
  bankUserToken,
  superAdminToken,
  savajCapitalUserToken,
  userToken,
} = require("../utils/authhelper");
const axios = require("axios");
const puppeteer = require("puppeteer");

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
      const decryptedPassword = decrypt(superAdmin.password);
      if (req.body.password !== decryptedPassword) {
        return res
          .status(201)
          .send({ statusCode: 202, message: "Password is incorrect." });
      }
      userForToken = superAdmin;
      role = "superadmin";
      ({ token, expiresIn } = await superAdminToken(userForToken));
    } else if (savajCapitalUser) {
      const decryptedPassword = decrypt(savajCapitalUser.password);
      if (req.body.password !== decryptedPassword) {
        return res
          .status(201)
          .send({ statusCode: 202, message: "Password is incorrect." });
      }
      userForToken = savajCapitalUser;
      role = "savajcapitaluser";
      ({ token, expiresIn } = await savajCapitalUserToken(userForToken));
    } else if (user) {
      const decryptedPassword = decrypt(user.password);
      if (req.body.password !== decryptedPassword) {
        return res
          .status(201)
          .send({ statusCode: 202, message: "Password is incorrect." });
      }
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

router.get("/idb_check", async (req, res) => {
  try {
    const panCard = req.query.panCard;

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    const pages = await browser.pages();
    if (pages.length > 1) {
      await pages[0].close();
    }

    await page.goto("https://ibdlp.indianbank.in/GSTAdvantage/components");

    await page.waitForSelector('a[onclick="redirectToApplication()"]');
    await delay(1000);

    await page.evaluate(() => {
      document.querySelector('a[onclick="redirectToApplication()"]').click();
    });

    await page.waitForSelector('input[name="textbox1"]');
    await delay(2000);

    await page.type('input[name="textbox1"]', panCard);
    await delay(2000);

    res.send("PAN card filled successfully.");
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send("An error occurred while filling the PAN card.");
  }
});

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

module.exports = router;
