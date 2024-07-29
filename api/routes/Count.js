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
const BankUser = require("../models/Bank/BankUserSchema");
const SavajCapital_User = require("../models/Savaj_Capital/SavajCapital_User");
const BranchAssign = require("../models/Savaj_Capital/Branch_Assign");
const LoanStatus = require("../models/AddDocuments/LoanStatus");

router.get("/data-count", async (req, res) => {
  try {
    const bank = await Bank.countDocuments();
    const addUser = await AddUser.countDocuments();
    const savajCapitalbranch = await SavajCapital_Branch.countDocuments();
    const superAdmin = await SuperAdmin.countDocuments();
    const role = await SavajCapital_Role.countDocuments();
    const files = await File_Uplode.countDocuments();
    const savajuser = await SavajCapital_User.countDocuments();
    const bankuser = await BankUser.countDocuments();
    const savajuserassignfile = await BranchAssign.countDocuments();
    const bankuserassignfile = await BankApproval.countDocuments();

    res.json({
      banks: bank,
      users: addUser,
      savajcapitalbrnach: savajCapitalbranch,
      superadmin: superAdmin,
      role: role,
      files: files,
      savajuser: savajuser,
      bankuser: bankuser,
      savajuserassignfile: savajuserassignfile,
      bankuserassignfile: bankuserassignfile,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).send("Error fetching counts");
  }
});

router.get("/loan-files", async (req, res) => {
  try {
    const loans = await Loan.find().lean();

    const [allStatuses, allLoanTypes, allFiles] = await Promise.all([
      LoanStatus.find().lean(),
      Loan_Type.find().lean(),
      File_Uplode.find().lean(),
    ]);

    const loanTypeMap = allLoanTypes.reduce((map, loanType) => {
      map[loanType.loan_id] = map[loanType.loan_id] || [];
      map[loanType.loan_id].push(loanType);
      return map;
    }, {});

    const statusMap = allStatuses.reduce((map, status) => {
      map[status.loanstatus_id] = status;
      return map;
    }, {});

    const enhancedLoans = loans
      .map((loan) => {
        const loanTypes = loanTypeMap[loan.loan_id] || [
          { loan_type: "Unknown", subtype: "Main", loantype_id: "" },
        ];
        const allLoanFiles = allFiles.filter(
          (file) => file.loan_id === loan.loan_id
        );

        return loanTypes.map((loanType) => {
          const filteredFiles = allLoanFiles.filter(
            (file) =>
              loanType.loantype_id === "" ||
              file.loantype_id === loanType.loantype_id
          );

          const statusCounts = allStatuses.reduce((acc, status) => {
            acc[status.loanstatus] = { count: 0, color: status.color };
            return acc;
          }, {});

          filteredFiles.forEach((file) => {
            const loanStatus = statusMap[file.status];
            if (loanStatus) {
              statusCounts[loanStatus.loanstatus].count++;
            }
          });

          return {
            ...loan,
            loanType: loanType.loan_type,
            subtype: loanType.subtype || "Main",
            files: filteredFiles.map((file) => ({
              file_id: file.file_id,
              status: file.status,
            })),
            fileCount: filteredFiles.length,
            loantype_id: loanType.loantype_id,
            statusCounts,
          };
        });
      })
      .flat();

    const flattenedLoans = enhancedLoans.filter(
      (loan) => loan.files.length > 0
    );
    res.json(flattenedLoans);
  } catch (error) {
    console.error("Error fetching loan and file data:", error);
    res.status(500).send("Error in fetching loan and file data");
  }
});

router.get(
  "/loan-files-scbranch/:state/:city/:branchuser_id?",
  async (req, res) => {
    try {
      const { state, city, branchuser_id } = req.params;

      const branchAssignments = await Branch_Assign.find({
        branchuser_id,
      }).lean();
      const allStatuses = await LoanStatus.find().lean();

      const statusMap = allStatuses.reduce((map, status) => {
        map[status.loanstatus_id] = status;
        return map;
      }, {});

      const loanIds = [...new Set(branchAssignments.map((a) => a.loan_id))];

      const loans = await Loan.find({ loan_id: { $in: loanIds } }).lean();
      const loanMap = loans.reduce((map, loan) => {
        map[loan.loan_id] = loan;
        return map;
      }, {});

      const loanTypeIds = [
        ...new Set(branchAssignments.map((a) => a.loantype_id)),
      ];

      const loanTypes = await Loan_Type.find({
        loantype_id: { $in: loanTypeIds },
      }).lean();

      const loanTypeMap = loanTypes.reduce((map, loanType) => {
        map[loanType.loantype_id] = loanType;
        return map;
      }, {});

      const allFiles = await File_Uplode.find({
        loan_id: { $in: loanIds },
      }).lean();

      const users = await AddUser.find({
        user_id: { $in: allFiles.map((file) => file.user_id) },
      }).lean();
      const userMap = users.reduce((map, user) => {
        map[user.user_id] = user;
        return map;
      }, {});

      const enhancedLoans = [];

      for (const assignment of branchAssignments) {
        const loan = loanMap[assignment.loan_id];
        if (!loan) continue;

        const loanType = loanTypeMap[assignment.loantype_id] || {
          loan_type: "Unknown",
          subtype: "Main",
          loantype_id: "",
        };

        const filteredFiles = allFiles.filter(
          (file) =>
            file.loan_id === loan.loan_id &&
            file.loantype_id === assignment.loantype_id
        );

        const stateCityFiles = [];
        const branchAssignmentFiles = [];
        let branchAssignmentFileCount = 0;

        for (const file of filteredFiles) {
          const user = userMap[file.user_id];
          if (user && user.state === state && user.city === city) {
            stateCityFiles.push({
              file_id: file.file_id,
              filename: file.filename,
              typename: file.typename,
              status: file.status,
            });

            if (assignment.file_id.includes(file.file_id)) {
              branchAssignmentFiles.push(file);
              branchAssignmentFileCount++;
            }
          }
        }

        const statusCounts = branchAssignmentFiles.reduce((acc, file) => {
          const loanStatus = statusMap[file.status];
          if (loanStatus) {
            if (!acc[loanStatus.loanstatus]) {
              acc[loanStatus.loanstatus] = {
                count: 0,
                color: loanStatus.color,
              };
            }
            acc[loanStatus.loanstatus].count++;
          }
          return acc;
        }, {});

        enhancedLoans.push({
          ...loan,
          loanType: loanType.loan_type,
          subtype: loanType.subtype || "Main",
          state,
          city,
          files: stateCityFiles,
          fileCount: branchAssignmentFileCount,
          loantype_id: loanType.loantype_id,
          statusCounts,
        });
      }

      const consolidatedLoans = [];
      const loanMapForConsolidation = new Map();

      for (const loan of enhancedLoans) {
        if (loan.loanType === "Unknown" && loan.loantype_id === "") {
          if (loanMapForConsolidation.has(loan.loan_id)) {
            const existingLoan = loanMapForConsolidation.get(loan.loan_id);
            existingLoan.fileCount += loan.fileCount;
            existingLoan.files.push(...loan.files);
            Object.keys(loan.statusCounts).forEach((status) => {
              if (!existingLoan.statusCounts[status]) {
                existingLoan.statusCounts[status] = {
                  count: 0,
                  color: loan.statusCounts[status].color,
                };
              }
              existingLoan.statusCounts[status].count +=
                loan.statusCounts[status].count;
            });
          } else {
            loanMapForConsolidation.set(loan.loan_id, { ...loan });
          }
        } else {
          consolidatedLoans.push(loan);
        }
      }

      consolidatedLoans.push(...loanMapForConsolidation.values());

      const filteredLoans = consolidatedLoans.filter(
        (loan) => loan.files.length > 0
      );

      res.json(filteredLoans);
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
      const allStatuses = await LoanStatus.find().lean();

      const statusMap = allStatuses.reduce((map, status) => {
        map[status.loanstatus_id] = status;
        return map;
      }, {});

      const loanIds = [...new Set(bankApprovals.map((a) => a.loan_id))];

      const loans = await Loan.find({ loan_id: { $in: loanIds } }).lean();
      const loanMap = loans.reduce((map, loan) => {
        map[loan.loan_id] = loan;
        return map;
      }, {});

      const loanTypeIds = [...new Set(bankApprovals.map((a) => a.loantype_id))];

      const loanTypes = await Loan_Type.find({
        loantype_id: { $in: loanTypeIds },
      }).lean();

      const loanTypeMap = loanTypes.reduce((map, loanType) => {
        map[loanType.loantype_id] = loanType;
        return map;
      }, {});

      const allFiles = await File_Uplode.find({
        loan_id: { $in: loanIds },
      }).lean();

      const users = await AddUser.find({
        user_id: { $in: allFiles.map((file) => file.user_id) },
      }).lean();
      const userMap = users.reduce((map, user) => {
        map[user.user_id] = user;
        return map;
      }, {});

      const enhancedLoans = [];

      for (const assignment of bankApprovals) {
        const loan = loanMap[assignment.loan_id];
        if (!loan) continue;

        const loanType = loanTypeMap[assignment.loantype_id] || {
          loan_type: "Unknown",
          subtype: "Main",
          loantype_id: "",
        };

        const filteredFiles = allFiles.filter(
          (file) =>
            file.loan_id === loan.loan_id &&
            file.loantype_id === assignment.loantype_id
        );

        const stateCityFiles = [];
        const branchAssignmentFiles = [];
        let branchAssignmentFileCount = 0;

        for (const file of filteredFiles) {
          const user = userMap[file.user_id];
          if (user && user.state === state && user.city === city) {
            stateCityFiles.push({
              file_id: file.file_id,
              filename: file.filename,
              typename: file.typename,
              status: file.status,
            });

            if (assignment.file_id.includes(file.file_id)) {
              branchAssignmentFiles.push(file);
              branchAssignmentFileCount++;
            }
          }
        }

        const statusCounts = branchAssignmentFiles.reduce((acc, file) => {
          const loanStatus = statusMap[file.status];
          if (loanStatus) {
            if (!acc[loanStatus.loanstatus]) {
              acc[loanStatus.loanstatus] = {
                count: 0,
                color: loanStatus.color,
              };
            }
            acc[loanStatus.loanstatus].count++;
          }
          return acc;
        }, {});

        enhancedLoans.push({
          ...loan,
          loanType: loanType.loan_type,
          subtype: loanType.subtype || "Main",
          state,
          city,
          files: stateCityFiles,
          fileCount: branchAssignmentFileCount,
          loantype_id: loanType.loantype_id,
          statusCounts,
        });
      }

      const consolidatedLoans = [];
      const loanMapForConsolidation = new Map();

      for (const loan of enhancedLoans) {
        if (loan.loanType === "Unknown" && loan.loantype_id === "") {
          if (loanMapForConsolidation.has(loan.loan_id)) {
            const existingLoan = loanMapForConsolidation.get(loan.loan_id);
            existingLoan.fileCount += loan.fileCount;
            existingLoan.files.push(...loan.files);
            Object.keys(loan.statusCounts).forEach((status) => {
              if (!existingLoan.statusCounts[status]) {
                existingLoan.statusCounts[status] = {
                  count: 0,
                  color: loan.statusCounts[status].color,
                };
              }
              existingLoan.statusCounts[status].count +=
                loan.statusCounts[status].count;
            });
          } else {
            loanMapForConsolidation.set(loan.loan_id, { ...loan });
          }
        } else {
          consolidatedLoans.push(loan);
        }
      }

      consolidatedLoans.push(...loanMapForConsolidation.values());

      const filteredLoans = consolidatedLoans.filter(
        (loan) => loan.files.length > 0
      );

      res.json(filteredLoans);
    } catch (error) {
      console.error("Error fetching loan and file data:", error);
      res.status(500).send("Error in fetching loan and file data");
    }
  }
);

router.get("/files-within-date-range", async (req, res) => {
  try {
    const currentDate = moment().format("YYYY-MM-DD");

    const files = await File_Uplode.find({
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    }).lean();

    if (files.length === 0) {
      return res
        .status(404)
        .json({ message: "No files found within the date range." });
    }

    const enhancedFiles = await Promise.all(
      files.map(async (file) => {
        const loan = await Loan.findOne({ loan_id: file.loan_id }).lean();
        const user = await AddUser.findOne({ user_id: file.user_id }).lean();
        const loantype = file.loantype_id
          ? await Loan_Type.findOne({ loantype_id: file.loantype_id }).lean()
          : null;

        return {
          ...file,
          loan,
          user,
          loantype,
        };
      })
    );

    res.json(enhancedFiles);
  } catch (error) {
    console.error("Error fetching files within date range:", error);
    res.status(500).send("Error fetching files within date range");
  }
});

module.exports = router;
