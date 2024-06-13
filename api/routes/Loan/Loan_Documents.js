const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan_Documents = require("../../models/Loan/Loan_Documents");
const AddDocuments = require("../../models/AddDocuments/AddDocuments");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Title = require("../../models/AddDocuments/Title");
const File_Uplode = require("../../models/File/File_Uplode");

router.get("/:loan_id", async (req, res) => {
  try {
    const loan_id = req.params.loan_id;

    const data = await Loan_Documents.aggregate([
      {
        $match: { loan_id: loan_id },
      },
      {
        $addFields: {
          hasIndex: {
            $cond: {
              if: { $ifNull: ["$index", false] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sort: {
          hasIndex: -1,
          index: 1,
          updatedAt: -1,
        },
      },
    ]);

    const documentIds = data.reduce((ids, doc) => {
      ids.push(...doc?.document_ids);
      return ids;
    }, []);

    const documents = await AddDocuments.find({
      document_id: { $in: documentIds },
    });

    const enrichedData = data.map((doc) => {
      if (!doc.document_ids || doc.document_ids.length === 0) {
        return { ...doc, document_names: [] };
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

router.get("/documents/:loan_id/:loantype_id", async (req, res) => {
  try {
    const loan_id = req.params.loan_id;
    const loantype_id = req.params.loantype_id;

    const data = await Loan_Documents.aggregate([
      {
        $match: { loan_id: loan_id, loantype_id: loantype_id },
      },
      {
        $addFields: {
          hasIndex: {
            $cond: {
              if: { $ifNull: ["$index", false] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sort: {
          hasIndex: -1,
          index: 1,
          updatedAt: -1,
        },
      },
    ]);

    const documentIds = data.reduce((ids, doc) => {
      ids.push(...doc?.document_ids);
      return ids;
    }, []);

    const documents = await AddDocuments.find({
      document_id: { $in: documentIds },
    });

    const enrichedData = data.map((doc) => {
      if (!doc.document_ids || doc.document_ids.length === 0) {
        return { ...doc, document_names: [] };
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

router.delete("/:loan_document_id", async (req, res) => {
  try {
    const { loan_document_id } = req.params;
    const { loan_id } = req.body;

    const loanDocument = await Loan_Documents.findOne({
      loan_document_id: loan_document_id,
    });

    if (!loanDocument) {
      return res.status(404).json({
        success: false,
        message: "Loan document not found",
      });
    }

    const documentIds = loanDocument.document_ids;

    const isReferenced = await File_Uplode.findOne({
      "documents.loan_document_id": { $in: documentIds },
    });

    const isLoanIdAvailable = await File_Uplode.exists({ loan_id: loan_id });

    if (!isLoanIdAvailable || !isReferenced) {
      await Loan_Documents.findOneAndDelete({
        loan_document_id: loan_document_id,
      });

      return res.json({
        success: true,
        message: "Loan document deleted successfully",
        deletedLoanDocumentId: loan_document_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Loan document cannot be deleted as it's associated with a loan or referenced in a file",
      });
    }
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

    const existingDocument = await Loan_Documents.findOne({
      loan_id,
      ...(loantype_id && { loantype_id }),
      title_id: { $regex: new RegExp(`^${title_id}$`, "i") },
    });

    if (existingDocument) {
      const newDocumentIds = document_id.filter(
        (id) => !existingDocument.document_ids.includes(id)
      );

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
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      const newDocument = await Loan_Documents.create({
        loan_document_id: uniqueId,
        loan_id,
        loantype_id,
        title_id,
        document_ids: document_id,
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

    const data = await Loan_Documents.aggregate([
      {
        $match: { loan_document_id: loan_document_id },
      },
    ]);

    const documentIds = data.reduce((ids, doc) => {
      ids.push(...doc?.document_ids);
      return ids;
    }, []);

    const documents = await AddDocuments.find({
      document_id: { $in: documentIds },
    });

    const enrichedData = data.map((doc) => {
      if (!doc.document_ids || doc.document_ids.length === 0) {
        return { ...doc, document_names: [] };
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

    const existingDocument = await Loan_Documents.findOne({
      loan_id,
      ...(loantype_id && { loantype_id }),
      title_id: { $regex: new RegExp(`^${title_id}$`, "i") },
    });

    if (existingDocument) {
      existingDocument.document_ids = document_id;
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

router.put("/update-index/:loan_document_id", async (req, res) => {
  try {
    const { loan_document_id } = req.params;
    const { newIndex } = req.body;

    const loanDocument = await Loan_Documents.findOne({ loan_document_id });
    if (!loanDocument) {
      return res
        .status(404)
        .json({ success: false, message: "Loan document not found" });
    }

    const { loan_id, loantype_id } = loanDocument;

    const existingDocumentWithIndex = await Loan_Documents.findOne({
      loan_id,
      loantype_id,
      index: newIndex,
      loan_document_id: { $ne: loan_document_id },
    });

    if (existingDocumentWithIndex) {
      return res.status(409).json({
        success: false,
        message: `Another document with index ${newIndex} already exists.`,
      });
    }

    loanDocument.index = newIndex;
    await loanDocument.save();

    res.json({
      success: true,
      message: `Document index updated successfully to ${newIndex}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
