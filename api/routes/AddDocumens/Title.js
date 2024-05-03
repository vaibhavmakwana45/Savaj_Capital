const express = require("express");
const router = express.Router();
const moment = require("moment");
const Title = require("../../models/AddDocuments/Title");
const File_Uplode = require("../../models/File/File_Uplode");
const Loan_Documents = require("../../models/Loan/Loan_Documents");

// Post Documents
router.post("/", async (req, res) => {
  try {
    let findLoanStep = await Title.findOne({
      title: { $regex: new RegExp(`^${req.body.title}$`, "i") },
    });
    if (!findLoanStep) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["title_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      var data = await Title.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Title Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.title} Already Added`,
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
    const data = await Title.find({});
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

//  Update Title
router.put("/:title_id", async (req, res) => {
  try {
    const { title_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await Title.findOneAndUpdate(
      { title_id: title_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Title Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Title not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

//  Delete Title
// router.delete("/:title_id", async (req, res) => {
//   try {
//     const { title_id } = req.params;

//     const deletedTitle = await Title.findOneAndDelete({
//       title_id: title_id,
//     });

//     if (!deletedTitle) {
//       return res.status(200).json({
//         statusCode: 202,
//         message: "Title not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Title deleted successfully",
//       deletedDocumentId: title_id,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// });

router.delete("/:title_id", async (req, res) => {
  try {
    const { title_id } = req.params;

    // Check if the title_id exists in any document's title_id field in file-uploads collection
    const titleExistsInFileUploads = await File_Uplode.findOne({
      "documents.title_id": title_id,
    });

    // Check if the title_id exists in any document's title_id field in loan-documents collection
    const titleExistsInLoanDocuments = await Loan_Documents.findOne({
      title_id: title_id,
    });

    // If the title exists in any document in either collection, return an error response
    if (titleExistsInFileUploads || titleExistsInLoanDocuments) {
      return res.status(200).json({
        statusCode: 201,
        message: "Title cannot be deleted because it is currently in use.",
      });
    }

    // If the title doesn't exist in any document, proceed with deletion
    const deletedTitle = await Title.findOneAndDelete({
      title_id: title_id,
    });

    if (!deletedTitle) {
      return res.status(404).json({
        success: false,
        message: "Title not found",
      });
    }

    res.json({
      success: true,
      message: "Title deleted successfully",
      deletedDocumentId: title_id,
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
