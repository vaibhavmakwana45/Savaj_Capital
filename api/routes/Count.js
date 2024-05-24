const express = require("express");
const router = express.Router();
const moment = require("moment");
const Bank = require("../models/Bank/BankSchema");
const AddUser = require("../models/AddUser");
const SuperAdmin = require("../models/SuperAdminSignupSchema");
const SavajCapital_Role = require("../models/Savaj_Capital/SavajCapital_Role");
const SavajCapital_Branch = require("../models/Savaj_Capital/SavajCapital_Branch");
const File_Uplode = require("../models/File/File_Uplode");
const Loan = require("../models/Loan/Loan");
const Loan_Type = require("../models/Loan/Loan_Type");

router.get("/data-count", async (req, res) => {
  try {
    const bank = await Bank.countDocuments();
    const addUser = await AddUser.countDocuments();
    const savajCapitalbranch = await SavajCapital_Branch.countDocuments();
    const superAdmin = await SuperAdmin.countDocuments();
    const role = await SavajCapital_Role.countDocuments();
    const files = await File_Uplode.countDocuments();

    res.json({
      banks: bank,
      users: addUser,
      savajcapitalbrnach: savajCapitalbranch,
      superadmin: superAdmin,
      role: role,
      files: files,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).send("Error fetching counts");
  }
});

router.get("/loan-files", async (req, res) => {
  try {
    const loans = await Loan.find().lean();

    const enhancedLoans = [];

    for (const loan of loans) {
      let loanTypes = await Loan_Type.find({ loan_id: loan.loan_id }).lean();
      const allFiles = await File_Uplode.find({ loan_id: loan.loan_id }).lean();

      if (loanTypes.length === 0) {
        loanTypes = [{ loan_type: "Unknown", subtype: "Main", loantype_id: "" }];
      }

      for (const loanType of loanTypes) {
        const filteredFiles = allFiles.filter(file =>
          loanType.loantype_id === "" || file.loantype_id === loanType.loantype_id
        );
        enhancedLoans.push({
          ...loan,
          loanType: loanType.loan_type,
          subtype: loanType.subtype || "Main",
          files: filteredFiles.map(file => ({
            filename: file.filename,
            typename: file.typename,
          })),
          fileCount: filteredFiles.length,
          loantype_id: loanType.loantype_id, // Include loantype_id for all loan types
        });
      }
    }

    const flattenedLoans = enhancedLoans.filter(loan => loan.files.length > 0);
    res.json(flattenedLoans);
  } catch (error) {
    console.error("Error fetching loan and file data:", error);
    res.status(500).send("Error in fetching loan and file data");
  }
});


module.exports = router;
