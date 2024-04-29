const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");

// Post Loan
let loanTypeCounter = 0;

router.post("/", async (req, res) => {
  try {
    // Check if the loan already exists
    let findLoan = await Loan.findOne({ loan: req.body.loan });

    if (!findLoan) {
      // Create a unique ID for the loan
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      // Add loan to the Loan collection
      const loanData = {
        loan_id: uniqueId,
        loan: req.body.loan,
        is_subtype: req.body.is_subtype,
        loan_step_id: req.body.loan_step_id,
        createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      };
      const loan = await Loan.create(loanData);

      // Add loan types to the Loan_Type collection
      if (req.body.loan_type && req.body.loan_type.length > 0) {
        const loanTypesData = req.body.loan_type.map((loanType, index) => {
          loanTypeCounter++; // Increment the counter for each loan type
          return {
            loantype_id: `${timestamp}_${loanTypeCounter}`, // Generate unique ID for each loan type
            loan_id: uniqueId,
            loan_type: loanType,
            createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
          };
        });

        await Loan_Type.insertMany(loanTypesData);
      }

      res.json({
        success: true,
        data: loan,
        message: "Loan and Loan Types added successfully",
      });
    } else {
      res.status(400).json({
        statusCode: 400,
        message: `${req.body.loan} Loan Already Added`,
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Loan
router.get("/", async (req, res) => {
  try {
    var data = await Loan.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const loan_id = data[i].loan_id;

      data[i].loantype_count = 0;

      const loanTypeCount = await Loan_Type.countDocuments({ loan_id });

      if (loanTypeCount) {
        data[i].loantype_count = loanTypeCount;
      }
    }

    const count = data.length;

    res.json({
      success: true,
      data: data,
      count: count,
      message: "Read All Loan",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Update Loan
router.put("/:loan_id", async (req, res) => {
  try {
    const { loan_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await Loan.findOneAndUpdate(
      { loan_id: loan_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Loan Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Loan not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Delete Loan
router.delete("/:loan_id", async (req, res) => {
  try {
    const { loan_id } = req.params;

    const loan = await Loan_Type.findOne({
      loan_id: loan_id,
    });

    if (loan) {
      return res.status(200).json({
        statusCode: 201,
        message: "This Loan_Type is already in use",
      });
    }

    const deletedUser = await Loan.findOneAndDelete({
      loan_id: loan_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 202,
        message: "Loan not found",
      });
    }

    res.json({
      success: true,
      message: "Loan successfully deleted",
      deletedRoleId: loan_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/loan", async (req, res) => {
  try {
    const data = await Loan.find({});

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
module.exports = router;
