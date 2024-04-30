const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddDocuments = require("../../models/AddDocuments/AddDocuments");

// Post Documents
router.post("/", async (req, res) => {
  try {
    let findLoanStep = await AddDocuments.findOne({
      document: { $regex: new RegExp(`^${req.body.document}$`, "i") },
    });
    if (!findLoanStep) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["document_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      var data = await AddDocuments.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Document Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.document} Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Documents
router.get("/", async (req, res) => {
  try {
    const data = await AddDocuments.find({});
    if (data.length === 0) {
      // If no data found
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

// Update Documents
router.put("/:document_id", async (req, res) => {
  try {
    const { document_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await AddDocuments.findOneAndUpdate(
      { document_id: document_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Documents Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Documents not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//  Delete Documents
router.delete("/:document_id", async (req, res) => {
  try {
    const { document_id } = req.params;

    const deletedDocument = await AddDocuments.findOneAndDelete({
      document_id: document_id,
    });

    if (!deletedDocument) {
      return res.status(200).json({
        statusCode: 202,
        message: "Documents not found",
      });
    }

    res.json({
      success: true,
      message: "Documents deleted successfully",
      deletedDocumentId: document_id,
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
