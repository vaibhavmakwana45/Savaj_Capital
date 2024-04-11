const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan_Documents = require("../../models/Loan/Loan_Documents");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");

let loanTypeCounter = 0;

router.post("/", async (req, res) => {
  try {
    const { loan_id, loantype_id, loan_document } = req.body;

    const timestamp = Date.now();
    const createdAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    const loanDocumentsData = loan_document.map((document, index) => {
      const uniqueId = `${timestamp}_${index + 1}`;
      loanTypeCounter++;
      return {
        loan_document_id: uniqueId,
        loan_id: loan_id,
        loantype_id: loantype_id,
        loan_document: document,
        createdAt: createdAt,
        updatedAt: updatedAt,
      };
    });

    const createdDocuments = await Loan_Documents.insertMany(loanDocumentsData);

    res.json({
      success: true,
      data: createdDocuments,
      message: "Loan documents added successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Loan-Type
router.get("/:loantype_id", async (req, res) => {
  try {
    const { loantype_id } = req.params;

    const loanType = await Loan_Type.findOne({ loantype_id: loantype_id });

    var data = await Loan_Documents.aggregate([
      {
        $match: { loantype_id: loantype_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    if (loanType) {
      data = data.map((doc) => ({
        ...doc,
        loan_type: loanType.loan_type,
      }));
    }

    const count = data.length;

    res.json({
      success: true,
      data: data,
      count: count,
      message: "Read All Loan Documents for Specified Loan-Type",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Update Document Name
router.put("/:loan_document_id", async (req, res) => {
  try {
    const { loan_document_id } = req.params;

    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await Loan_Documents.findOneAndUpdate(
      { loan_document_id: loan_document_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Document Name Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Role not found",
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
router.delete("/:loan_document_id", async (req, res) => {
  try {
    const { loan_document_id } = req.params;

    const deletedDocument = await Loan_Documents.findOneAndDelete({
      loan_document_id: loan_document_id,
    });

    if (!deletedDocument) {
      return res.status(200).json({
        statusCode: 202,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      message: "Document deleted successfully",
      deletedRoleId: loan_document_id,
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
