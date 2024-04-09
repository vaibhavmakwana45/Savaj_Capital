const express = require("express");
const router = express.Router();
const moment = require("moment");
const Bank = require("../models/Bank/BankSchema");
const AddUser = require("../models/AddUser");
const SuperAdmin = require("../models/SuperAdminSignupSchema");
const SavajCapital_Role = require("../models/Savaj_Capital/SavajCapital_Role");
const SavajCapital_Branch = require("../models/Savaj_Capital/SavajCapital_Branch");

router.get("/data-count", async (req, res) => {
  try {
    const bank = await Bank.countDocuments();
    const addUser = await AddUser.countDocuments();
    const savajCapitalbranch = await SavajCapital_Branch.countDocuments();
    const superAdmin = await SuperAdmin.countDocuments();
    const role = await SavajCapital_Role.countDocuments();

    res.json({
      banks: bank,
      users: addUser,
      savajcapitalbrnach: savajCapitalbranch,
      superadmin: superAdmin,
      role: role,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).send("Error fetching counts");
  }
});

module.exports = router;
