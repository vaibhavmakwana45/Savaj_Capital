const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan_Step = require("../../models/Loan_Step/Loan_Step");

router.post("/", async (req, res) => {
  try {
    let findLoanStep = await Loan_Step.findOne({
      loan_step: req.body.loan_step,
    });
    if (!findLoanStep) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["loan_step_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      var data = await Loan_Step.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Loan Step Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.loan_step} Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


router.get("/", async (req, res) => {
    try {
      const data = await Loan_Step.find({});
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
