const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Loan_Step = require("../../models/Loan_Step/Loan_Step");
const File_Uplode = require("../../models/File/File_Uplode");
const Loan_Documents = require("../../models/Loan/Loan_Documents");

let loanTypeCounter = 0;

router.post("/", async (req, res) => {
  try {
    let findLoan = await Loan.findOne({ loan: req.body.loan });

    if (!findLoan) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      const loanData = {
        loan_id: uniqueId,
        loan: req.body.loan,
        is_subtype: req.body.is_subtype,
        loan_step_id: req.body.loan_step_id,
        createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      };
      const loan = await Loan.create(loanData);

      if (req.body.loan_type && req.body.loan_type.length > 0) {
        const loanTypesData = req.body.loan_type.map((loanType, index) => {
          loanTypeCounter++;
          return {
            loantype_id: `${timestamp}_${loanTypeCounter}`,
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

router.get("/", async (req, res) => {
  try {
    const loans = await Loan.aggregate([{ $sort: { updatedAt: -1 } }]).exec();

    const loanIds = loans.map((loan) => loan.loan_id);

    const loanTypeCounts = await Loan_Type.aggregate([
      { $match: { loan_id: { $in: loanIds } } },
      { $group: { _id: "$loan_id", count: { $sum: 1 } } },
    ]).exec();

    const loanTypeCountMap = new Map(
      loanTypeCounts.map((doc) => [doc._id, doc.count])
    );

    const loanStepIds = loans.flatMap((loan) => loan.loan_step_id || []);

    const loanSteps = await Loan_Step.find({
      loan_step_id: { $in: loanStepIds },
    }).exec();

    const loanStepMap = new Map(
      loanSteps.map((step) => [
        step.loan_step_id,
        { id: step.loan_step_id, name: step.loan_step },
      ])
    );

    for (const loan of loans) {
      loan.loantype_count = loanTypeCountMap.get(loan.loan_id) || 0;

      if (loan.loan_step_id && loan.loan_step_id.length) {
        loan.loan_steps = loan.loan_step_id.map(
          (id) => loanStepMap.get(id) || { id, name: "Unknown" }
        );
      } else {
        loan.loan_steps = [];
      }
    }

    res.json({
      success: true,
      data: loans,
      count: loans.length,
      message: "Read All Loan",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/:loan_id", async (req, res) => {
  try {
    const { loan_id } = req.params;

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

router.delete("/:loan_id", async (req, res) => {
  try {
    const { loan_id } = req.params;

    const loanInUse = await Loan_Documents.findOne({ loan_id: loan_id });
    if (loanInUse) {
      return res.status(400).json({
        statusCode: 400,
        message: "Documemnt are found with this loan",
      });
    }

    const fileInUse = await File_Uplode.findOne({ loan_id: loan_id });
    if (fileInUse) {
      return res.status(400).json({
        statusCode: 400,
        message: "Loan cannot be deleted as it is in use in file",
      });
    }

    const loanTypeInUse = await Loan_Type.findOne({ loan_id: loan_id });
    if (loanTypeInUse) {
      return res.status(400).json({
        statusCode: 400,
        message: "This Loan_Type is already in use and cannot be deleted",
      });
    }

    const deletedLoan = await Loan.findOneAndDelete({ loan_id: loan_id });
    if (!deletedLoan) {
      return res.status(404).json({
        statusCode: 404,
        message: "Loan not found",
      });
    }

    res.json({
      success: true,
      message: "Loan successfully deleted",
      deletedLoanId: loan_id,
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

router.get("/all-loans", async (req, res) => {
  try {
    const loans = await Loan.find({});

    const loansWithSubtypes = await Promise.all(
      loans.map(async (loan) => {
        const subtypes = await Loan_Type.find({ loan_id: loan.loan_id });
        return {
          ...loan.toObject(),
          subtypes: subtypes.length > 0 ? subtypes : [],
        };
      })
    );

    res.json({
      success: true,
      data: loansWithSubtypes,
      message: "Loans and their subtypes fetched successfully",
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
