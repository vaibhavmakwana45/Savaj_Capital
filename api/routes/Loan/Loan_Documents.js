const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan_Documents = require("../../models/Loan/Loan_Documents");
const AddDocuments = require("../../models/AddDocuments/AddDocuments");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Title = require("../../models/AddDocuments/Title");

let loanTypeCounter = 0;

router.get("/:loan_id", async (req, res) => {
  try {
    const loan_id = req.params.loan_id;

    // Fetch loan documents
    const data = await Loan_Documents.aggregate([
      {
        $match: { loan_id: loan_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    // Extract document IDs from the fetched loan documents
    const documentIds = data.reduce((ids, doc) => {
      ids.push(...doc?.document_ids);
      return ids;
    }, []);

    // Fetch document names based on the document IDs
    const documents = await AddDocuments.find({
      document_id: { $in: documentIds },
    });

    // Map document names to loan documents
    const enrichedData = data.map((doc) => {
      if (!doc.document_ids || doc.document_ids.length === 0) {
        return { ...doc, document_names: [] }; // No document IDs found
      }

      const documentNames = doc.document_ids.map((id) => {
        const document = documents.find((doc) => doc.document_id === id);
        return document ? document.document : null;
      });
      return { ...doc, document_names: documentNames };
    });

    for (let i = 0; i < enrichedData.length; i++) {
      const title_id = enrichedData[i].title_id;

      const titleData = await Title.findOne({ title_id: title_id });
      enrichedData[i].title = titleData.title;
    }

    const count = enrichedData.length;

    res.json({
      // statusCode: 200,
      success: true,
      data: enrichedData,
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

router.get("/documents/:loan_id/:loantype_id", async (req, res) => {
  try {
    const loan_id = req.params.loan_id;
    const loantype_id = req.params.loantype_id;

    // Fetch loan documents
    const data = await Loan_Documents.aggregate([
      {
        $match: { loan_id: loan_id, loantype_id: loantype_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    // Extract document IDs from the fetched loan documents
    const documentIds = data.reduce((ids, doc) => {
      ids.push(...doc?.document_ids);
      return ids;
    }, []);

    // Fetch document names based on the document IDs
    const documents = await AddDocuments.find({
      document_id: { $in: documentIds },
    });

    // Map document names to loan documents
    const enrichedData = data.map((doc) => {
      if (!doc.document_ids || doc.document_ids.length === 0) {
        return { ...doc, document_names: [] }; // No document IDs found
      }

      const documentNames = doc.document_ids.map((id) => {
        const document = documents.find((doc) => doc.document_id === id);
        return document ? document.document : null;
      });
      return { ...doc, document_names: documentNames };
    });

    for (let i = 0; i < enrichedData.length; i++) {
      const title_id = enrichedData[i].title_id;

      const titleData = await Title.findOne({ title_id: title_id });
      enrichedData[i].title = titleData.title;
    }

    const count = enrichedData.length;

    res.json({
      // statusCode: 200,
      success: true,
      data: enrichedData,
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

router.post("/", async (req, res) => {
  try {
    const { loan_id, loantype_id, document_id, title_id } = req.body;

    // Find the existing document based on loan_id, loantype_id (if provided), and title
    const existingDocument = await Loan_Documents.findOne({
      loan_id,
      ...(loantype_id && { loantype_id }),
      title_id: { $regex: new RegExp(`^${title_id}$`, "i") },
    });

    if (existingDocument) {
      // Check if any of the new document_ids are already present in the existing document
      const newDocumentIds = document_id.filter(
        (id) => !existingDocument.document_ids.includes(id)
      );

      // If there are new document_ids, push them to the existing document's document_ids array
      if (newDocumentIds.length > 0) {
        existingDocument.document_ids.push(...newDocumentIds);
        existingDocument.updatedAt = moment()
          .utcOffset(330)
          .format("YYYY-MM-DD HH:mm:ss");
        await existingDocument.save();
      }

      return res.json({
        success: true,
        data: existingDocument,
        message: "Document updated successfully",
      });
    } else {
      // If document does not exist, create a new document
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      const newDocument = await Loan_Documents.create({
        loan_document_id: uniqueId,
        loan_id,
        loantype_id,
        title_id,
        document_ids: document_id, // Pass document_id as a flat array of strings
        createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      });

      return res.json({
        success: true,
        data: newDocument,
        message: "Document created successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/doc_edit/:loan_document_id", async (req, res) => {
  try {
    const loan_document_id = req.params.loan_document_id;

    // Fetch loan documents
    const data = await Loan_Documents.aggregate([
      {
        $match: { loan_document_id: loan_document_id },
      },
    ]);

    // Extract document IDs from the fetched loan documents
    const documentIds = data.reduce((ids, doc) => {
      ids.push(...doc?.document_ids);
      return ids;
    }, []);

    // Fetch document names based on the document IDs
    const documents = await AddDocuments.find({
      document_id: { $in: documentIds },
    });

    // Map document names to loan documents
    const enrichedData = data.map((doc) => {
      if (!doc.document_ids || doc.document_ids.length === 0) {
        return { ...doc, document_names: [] }; // No document IDs found
      }

      const documentNames = doc.document_ids.map((id) => {
        const document = documents.find((doc) => doc.document_id === id);
        return document ? document.document : null;
      });
      return { ...doc, document_names: documentNames };
    });

    for (let i = 0; i < enrichedData.length; i++) {
      const title_id = enrichedData[i].title_id;
      const loan_id = enrichedData[i].loan_id;
      const loantype_id = enrichedData[i]?.loantype_id;

      const titleData = await Title.findOne({ title_id: title_id });
      const loanData = await Loan.findOne({ loan_id: loan_id });
      const loanTypeData = await Loan_Type.findOne({
        loantype_id: loantype_id,
      });
      enrichedData[i].title = titleData?.title;
      enrichedData[i].is_subtype = loanData?.is_subtype;
      enrichedData[i].loan = loanData?.loan;
      enrichedData[i].loan_type = loanTypeData?.loan_type;
    }

    const count = enrichedData.length;

    res.json({
      // statusCode: 200,
      success: true,
      data: enrichedData,
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

router.post("/update", async (req, res) => {
  try {
    const { loan_id, loantype_id, document_id, title_id } = req.body;

    // Find the existing document based on loan_id, loantype_id (if provided), and title
    const existingDocument = await Loan_Documents.findOne({
      loan_id,
      ...(loantype_id && { loantype_id }),
      title_id: { $regex: new RegExp(`^${title_id}$`, "i") },
    });

    if (existingDocument) {
      existingDocument.document_ids = document_id; // Replace old document_ids with new ones
      existingDocument.updatedAt = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");

      await existingDocument.save();

      return res.json({
        success: true,
        data: existingDocument,
        message: "Document IDs updated successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
