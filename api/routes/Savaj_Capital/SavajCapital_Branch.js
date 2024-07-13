const express = require("express");
const router = express.Router();
const moment = require("moment");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const Branch_Assign = require("../../models/Savaj_Capital/Branch_Assign");
const crypto = require("crypto");
const File_Uplode = require("../../models/File/File_Uplode");
const LoanStatus = require("../../models/AddDocuments/LoanStatus");
const AddUser = require("../../models/AddUser");
const Loan = require("../../models/Loan/Loan");

const generateToken = () => {
  return crypto.randomBytes(18).toString("hex");
};

let currentToken = generateToken();

// Rotate the token every 3 minutes
setInterval(() => {
  currentToken = generateToken();
}, 180000); // 3 minutes in milliseconds

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
  const authToken = req.headers["authorization"];
  if (!authToken || authToken !== currentToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

// Post Branch
router.post("/", async (req, res) => {
  try {
    let findBranchName = await SavajCapital_Branch.findOne({
      branch_name: req.body.branch_name,
      state: req.body.state,
      city: req.body.city,
    });
    if (!findBranchName) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["branch_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      var data = await SavajCapital_Branch.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Branch Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.branch_name} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get All Branch
// router.get("/", async (req, res) => {
//   try {
//     const data = await SavajCapital_Branch.find({}).sort({ updatedAt: -1 });
//     res.json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// });
router.get("/", async (req, res) => {
  try {
    const branch = await SavajCapital_Branch.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    for (let i = 0; i < branch.length; i++) {
      const branch_id = branch[i].branch_id;

      const branchUserCount = await SavajCapital_User.countDocuments({ branch_id });
      branch[i].user_count = branchUserCount;
      let totalFileCount = 0; // Initialize file count for each bank

      const branchUsers = await SavajCapital_User.find({ branch_id });

      for (let j = 0; j < branchUsers.length; j++) {
        const branchuser_id = branchUsers[j].branchuser_id;

        const assignedFiles = await Branch_Assign.find({ branchuser_id });
        totalFileCount += assignedFiles.length; // Increment the file count

   
        for (let k = 0; k < assignedFiles.length; k++) {
          const file_id = assignedFiles[k].file_id;
          let fileDetails = await File_Uplode.findOne({
            file_id: file_id,
          }).lean();

          if (fileDetails) {
            const loanStatusDetails = await LoanStatus.findOne({
              loanstatus_id: fileDetails.status,
            }).lean();

   

            if (loanStatusDetails) {
              fileDetails.status = loanStatusDetails.loanstatus;
              fileDetails.status_color = loanStatusDetails.color;
            }

            const userDetails = await AddUser.findOne({
              user_id: fileDetails.user_id,
            }).lean();

            if (userDetails) {
              fileDetails.user_details = userDetails;
            }
            // Fetch loan details using loan_id
            const loanDetails = await Loan.findOne({
              loan_id: fileDetails.loan_id,
            }).lean();

            if (loanDetails) {
              fileDetails.loan_details = loanDetails;
            }
          }

          assignedFiles[k] = {
            ...assignedFiles[k].toObject(),
            file_details: fileDetails,
          };
        }

        branchUsers[j] = branchUsers[j].toObject();
        branchUsers[j].files = assignedFiles;
      }

      branch[i].users = branchUsers;
      branch[i].file_count = totalFileCount; // Assign the file count to the bank

    }

    const count = branch.length;

    res.json({
      success: true,
      data: branch,
      count: count,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Update Branch
router.put("/:branch_id", async (req, res) => {
  try {
    const { branch_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await SavajCapital_Branch.findOneAndUpdate(
      { branch_id: branch_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Branch Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Branch not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Pass branch_id and get Branch
router.get("/:branch_id", async (req, res) => {
  try {
    const branch_id = req.params.branch_id;
    const data = await SavajCapital_Branch.findOne({ branch_id });

    if (!data) {
      return res.status(200).json({
        statusCode: 201,
        message: "Savaj Capital Branch not found",
      });
    }
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Delete Branch
router.delete("/:branch_id", async (req, res) => {
  try {
    const { branch_id } = req.params;

    const savajBranchExistsInSavajUser = await SavajCapital_User.findOne({
      branch_id: branch_id,
    });
    const savajBranchExistsInSavajBranchAssign = await Branch_Assign.findOne({
      branch_id: branch_id,
    });

    if (savajBranchExistsInSavajUser || savajBranchExistsInSavajBranchAssign) {
      return res.status(200).json({
        statusCode: 201,
        message: "Branch cannot be deleted because it is currently in use.",
      });
    }

    const branch = await SavajCapital_User.findOne({ branch_id });

    if (branch) {
      return res.status(200).json({
        statusCode: 201,
        message: "Cannot delete. This Branch is assigned to users.",
      });
    }

    const deletedUser = await SavajCapital_Branch.findOneAndDelete({
      branch_id: branch_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 201,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Branch deleted successfully",
      deletedBranchId: branch_id,
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
