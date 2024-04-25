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
router.get("/:loan_id", async (req, res) => {
  try {
    const { loan_id } = req.params;

    const data = await Loan_Documents.find({ loan_id });

    if (data.length === 0) {
      return res.status(201).json({
        statusCode: 201,
        message: "Documents not found",
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
router.get("/loan_docs/:loan_id/:loantype_id", async (req, res) => {
  try {
    const { loan_id, loantype_id } = req.params;

    const data = await Loan_Documents.find({ loan_id, loantype_id });

    if (data.length === 0) {
      return res.status(201).json({
        statusCode: 201,
        message: "Documents not found",
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

router.delete("/:loan_document_id", async (req, res) => {
  try {
    const { loan_document_id } = req.params;

    const deletedLoanDocument = await Loan_Documents.findOneAndDelete({
      loan_document_id: loan_document_id,
    });

    if (!deletedLoanDocument) {
      return res.status(200).json({
        statusCode: 202,
        message: "Loan-Type not found",
      });
    }

    res.json({
      success: true,
      message: "Loan-Type deleted successfully",
      deletedLoanDocumentId: loan_document_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

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
        message: "Document Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Document not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
