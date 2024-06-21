const express = require("express");
const router = express.Router();
const moment = require("moment");
const LoanStatus = require("../../models/AddDocuments/LoanStatus");
const File_Uplode = require("../../models/File/File_Uplode");

router.post("/", async (req, res) => {
  try {
    let findLoanStatus = await LoanStatus.findOne({
      loanstatus: { $regex: new RegExp(`^${req.body.loanstatus}$`, "i") },
    });
    if (!findLoanStatus) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["loanstatus_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      var data = await LoanStatus.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Loan Status Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.loanstatus} Already Added`,
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
    const data = await LoanStatus.find({}).sort({ updatedAt: -1 });
    if (data.length === 0) {
      return res.status(201).json({
        statusCode: 201,
        message: "No data found",
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

router.put("/:loanstatus_id", async (req, res) => {
  try {
    const { loanstatus_id } = req.params;
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await LoanStatus.findOneAndUpdate(
      { loanstatus_id: loanstatus_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Loan Status Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Loan Status not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// router.delete("/:loanstatus_id", async (req, res) => {
//   try {
//     const { loanstatus_id } = req.params;

//     const deletedDocument = await LoanStatus.findOneAndDelete({
//       loanstatus_id: loanstatus_id,
//     });

//     if (!deletedDocument) {
//       return res.status(200).json({
//         statusCode: 202,
//         message: "Loan Status not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Loan Status deleted successfully",
//       deletedDocumentId: loanstatus_id,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// });
router.delete("/:loanstatus_id", async (req, res) => {
  try {
    const { loanstatus_id } = req.params;

    const isStatusInUse = await File_Uplode.findOne({ status: loanstatus_id });

    if (isStatusInUse) {
      return res.status(200).json({
        statusCode: 202,
        message: "Deletion not allowed: Loan Status is currently in use",
      });
    }

    const deletedDocument = await LoanStatus.findOneAndDelete({
      loanstatus_id,
    });

    if (!deletedDocument) {
      return res.status(200).json({
        statusCode: 202,
        message: "Loan Status not found",
      });
    }

    res.json({
      success: true,
      message: "Loan Status deleted successfully",
      deletedDocumentId: loanstatus_id,
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
