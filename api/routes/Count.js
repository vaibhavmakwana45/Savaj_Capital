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
const BankApproval = require("../models/Bank/BankApproval");
const Branch_Assign = require("../models/Savaj_Capital/Branch_Assign");

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
        loanTypes = [
          { loan_type: "Unknown", subtype: "Main", loantype_id: "" },
        ];
      }

      for (const loanType of loanTypes) {
        const filteredFiles = allFiles.filter(
          (file) =>
            loanType.loantype_id === "" ||
            file.loantype_id === loanType.loantype_id
        );
        enhancedLoans.push({
          ...loan,
          loanType: loanType.loan_type,
          subtype: loanType.subtype || "Main",
          files: filteredFiles.map((file) => ({
            filename: file.filename,
            typename: file.typename,
          })),
          fileCount: filteredFiles.length,
          loantype_id: loanType.loantype_id,
        });
      }
    }

    const flattenedLoans = enhancedLoans.filter(
      (loan) => loan.files.length > 0
    );
    res.json(flattenedLoans);
  } catch (error) {
    console.error("Error fetching loan and file data:", error);
    res.status(500).send("Error in fetching loan and file data");
  }
});

// router.get("/loan-files-scbranch/:state/:city/:loan_ids?", async (req, res) => {
//   try {
//     const { state, city, loan_ids } = req.params;

//     const loanIdsArray = loan_ids ? loan_ids.split(",") : [];

//     let loans;
//     if (loanIdsArray.length > 0) {
//       loans = await Loan.find({ loan_id: { $in: loanIdsArray } }).lean();
//     } else {
//       loans = await Loan.find().lean();
//     }

//     const enhancedLoans = [];

//     for (const loan of loans) {
//       let loanTypes = await Loan_Type.find({ loan_id: loan.loan_id }).lean();
//       const allFiles = await File_Uplode.find({ loan_id: loan.loan_id }).lean();

//       if (loanTypes.length === 0) {
//         loanTypes = [
//           { loan_type: "Unknown", subtype: "Main", loantype_id: "" },
//         ];
//       }

//       for (const loanType of loanTypes) {
//         const filteredFiles = allFiles.filter(
//           (file) =>
//             loanType.loantype_id === "" ||
//             file.loantype_id === loanType.loantype_id
//         );

//         const stateCityFiles = [];
//         for (const file of filteredFiles) {
//           const user = await AddUser.findOne({ user_id: file.user_id }).lean();
//           if (user && user.state === state && user.city === city) {
//             stateCityFiles.push(file);
//           }
//         }

//         enhancedLoans.push({
//           ...loan,
//           loanType: loanType.loan_type,
//           subtype: loanType.subtype || "Main",
//           state,
//           city,
//           files: stateCityFiles.map((file) => ({
//             filename: file.filename,
//             typename: file.typename,
//           })),
//           fileCount: stateCityFiles.length,
//           loantype_id: loanType.loantype_id,
//         });
//       }
//     }

//     const flattenedLoans = enhancedLoans.filter(
//       (loan) => loan.files.length > 0
//     );
//     res.json(flattenedLoans);
//   } catch (error) {
//     console.error("Error fetching loan and file data:", error);
//     res.status(500).send("Error in fetching loan and file data");
//   }
// });

router.get(
  "/loan-files-scbranch/:state/:city/:branchuser_id?",
  async (req, res) => {
    try {
      const { state, city, branchuser_id } = req.params;

      const bankApprovals = await Branch_Assign.find({ branchuser_id }).lean();

      const enhancedLoans = [];

      for (const approval of bankApprovals) {
        const loan = await Loan.findOne({ loan_id: approval.loan_id }).lean();

        if (!loan) {
          console.log(`Loan with ID ${approval.loan_id} not found.`);
          continue;
        }

        const loanTypes = await Loan_Type.find({
          loan_id: loan.loan_id,
          loantype_id: approval.loantype_id,
        }).lean();

        const allFiles = await File_Uplode.find({
          loan_id: loan.loan_id,
        }).lean();

        if (loanTypes.length === 0) {
          loanTypes.push({
            loan_type: "Unknown",
            subtype: "Main",
            loantype_id: "",
          });
        }

        for (const loanType of loanTypes) {
          const filteredFiles = allFiles.filter(
            (file) => file.loantype_id === loanType.loantype_id
          );

          const stateCityFiles = [];
          for (const file of filteredFiles) {
            const user = await AddUser.findOne({
              user_id: file.user_id,
            }).lean();
            if (user && user.state === state && user.city === city) {
              stateCityFiles.push(file);
            }
          }

          const fileCount = stateCityFiles.length;

          enhancedLoans.push({
            ...loan,
            loanType: loanType.loan_type,
            subtype: loanType.subtype || "Main",
            state,
            city,
            files: stateCityFiles.map((file) => ({
              filename: file.filename,
              typename: file.typename,
            })),
            fileCount,
            loantype_id: loanType.loantype_id,
          });
        }
      }

      const flattenedLoans = enhancedLoans.filter(
        (loan) => loan.files.length > 0
      );
      res.json(flattenedLoans);
    } catch (error) {
      console.error("Error fetching loan and file data:", error);
      res.status(500).send("Error in fetching loan and file data");
    }
  }
);

router.get(
  "/loan-files-bankbranch/:state/:city/:bankuser_id?",
  async (req, res) => {
    try {
      const { state, city, bankuser_id } = req.params;

      const bankApprovals = await BankApproval.find({ bankuser_id }).lean();

      const enhancedLoans = [];

      for (const approval of bankApprovals) {
        const loan = await Loan.findOne({ loan_id: approval.loan_id }).lean();

        if (!loan) {
          console.log(`Loan with ID ${approval.loan_id} not found.`);
          continue;
        }

        const loanTypes = await Loan_Type.find({
          loan_id: loan.loan_id,
          loantype_id: approval.loantype_id,
        }).lean();

        const allFiles = await File_Uplode.find({
          loan_id: loan.loan_id,
        }).lean();

        if (loanTypes.length === 0) {
          loanTypes.push({
            loan_type: "Unknown",
            subtype: "Main",
            loantype_id: "",
          });
        }

        for (const loanType of loanTypes) {
          const filteredFiles = allFiles.filter(
            (file) => file.loantype_id === loanType.loantype_id
          );

          const stateCityFiles = [];
          for (const file of filteredFiles) {
            const user = await AddUser.findOne({
              user_id: file.user_id,
            }).lean();
            if (user && user.state === state && user.city === city) {
              stateCityFiles.push(file);
            }
          }

          const fileCount = stateCityFiles.length;

          enhancedLoans.push({
            ...loan,
            loanType: loanType.loan_type,
            subtype: loanType.subtype || "Main",
            state,
            city,
            files: stateCityFiles.map((file) => ({
              filename: file.filename,
              typename: file.typename,
            })),
            fileCount,
            loantype_id: loanType.loantype_id,
          });
        }
      }

      const flattenedLoans = enhancedLoans.filter(
        (loan) => loan.files.length > 0
      );
      res.json(flattenedLoans);
    } catch (error) {
      console.error("Error fetching loan and file data:", error);
      res.status(500).send("Error in fetching loan and file data");
    }
  }
);

module.exports = router;
