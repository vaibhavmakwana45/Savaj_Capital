const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddDocuments = require("../../models/AddDocuments/AddDocuments");
const File_Uplode = require("../../models/File/File_Uplode");
const Loan_Documents = require("../../models/Loan/Loan_Documents");

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

router.get("/", async (req, res) => {
  try {
    const data = await AddDocuments.find({}).sort({ updatedAt: -1 });
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


// With pagination
// router.get("/", async (req, res) => {
//   try {
//     // Pagination parameters
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10; // Default limit to 10 documents per page

//     // Calculate skip value
//     const skip = (page - 1) * limit;

//     // Fetch documents with pagination
//     const data = await AddDocuments.find({})
//       .sort({ updatedAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     // Count total documents
//     const totalCount = await AddDocuments.countDocuments();

//     if (data.length === 0) {
//       // If no data found
//       return res.status(200).json({
//         statusCode: 200,
//         message: "No data found",
//       });
//     }

//     // Calculate total pages
//     const totalPages = Math.ceil(totalCount / limit);

//     res.json({
//       success: true,
//       data,
//       totalPages,
//       currentPage: page,
//       totalCount,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// });


router.put("/:document_id", async (req, res) => {
  try {
    const { document_id } = req.params;
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

router.delete("/:document_id", async (req, res) => {
  try {
    const { document_id } = req.params;

    const documentExistsInFileUploads = await File_Uplode.findOne({
      "documents.loan_document_id": document_id,
    });

    const documentExistsInLoanDocuments = await Loan_Documents.findOne({
      document_ids: document_id,
    });

    if (documentExistsInFileUploads || documentExistsInLoanDocuments) {
      return res.status(200).json({
        statusCode: 201,
        message: "Document cannot be deleted because it is currently in use.",
      });
    }

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
