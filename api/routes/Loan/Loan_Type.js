const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Loan_Documents = require("../../models/Loan/Loan_Documents");

router.post("/", async (req, res) => {
  try {
    let findLoanType = await Loan_Type.findOne({
      loan_id: req.body.loan_id,
      loan_type: req.body.loan_type,
    });
    if (!findLoanType) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["loantype_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");

      var data = await Loan_Type.create(req.body);

      res.json({
        success: true,
        data: data,
        message: "Add Loan-Type Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.loan_type} Loan_Type Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/:loan_id", async (req, res) => {
  try {
    var data = await Loan_Type.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const loan_id = data[i].loan_id;

      //     data[i].user_count = 0;

      //     const bankUserCount = await BankUser.countDocuments({ bank_id });

      //     if (bankUserCount) {
      //       data[i].user_count = bankUserCount;
      //     }

      const loan = await Loan.findOne({ loan_id: loan_id });

      if (loan) {
        data[i].loan = loan.loan;
      }
    }

    const count = data.length;

    res.json({
      success: true,
      data: data,
      count: count,
      message: "Read All Loan-Type",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/:loantype_id", async (req, res) => {
  try {
    const { loantype_id } = req.params;

    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await Loan_Type.findOneAndUpdate(
      { loantype_id: loantype_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Loan-Type Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Loan-Type not found",
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
router.delete("/:loantype_id", async (req, res) => {
  try {
    const { loantype_id } = req.params;

    const loanTypeInUse = await Loan_Documents.findOne({ loantype_id: loantype_id });
    if (loanTypeInUse) {
      return res.status(400).json({
        statusCode: 400,
        message: "Documemnt are found with this loan type",
      });
    }

    const deletedUser = await Loan_Type.findOneAndDelete({
      loantype_id: loantype_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 202,
        message: "Loan-Type not found",
      });
    }

    res.json({
      success: true,
      message: "Loan-Type deleted successfully",
      deletedRoleId: loantype_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/loan_type/:loan_id", async (req, res) => {
  try {
    const loan_id = req.params.loan_id;
    const loan = await Loan.find({ loan_id });
    const data = await Loan_Type.find({ loan_id });

    if (!data) {
      return res.status(200).json({
        statusCode: 201,
        message: "Loan-Type not found",
      });
    }
    res.json({
      success: true,
      loan,
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

router.get("/loan_type", async (req, res) => {
  try {
    const data = await Loan_Type.find({});

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
