const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan_Documents = require("../../models/Loan/Loan_Documents");

let loanTypeCounter = 0;

router.post("/", async (req, res) => {
  try {
    const { loan_id, loantype_id, loan_document } = req.body;

    const timestamp = Date.now();
    const createdAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    // Iterate over each loan document and create a separate object for each
    const loanDocumentsData = loan_document.map((document, index) => {
      const uniqueId = `${timestamp}_${index + 1}`; // Generate unique ID for each loan document
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

    // Add each loan document to the Loan_Documents collection
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

module.exports = router;
