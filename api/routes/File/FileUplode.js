const express = require("express");
const router = express.Router();
const moment = require("moment");
const File_Uplode = require("../../models/File/File_Uplode");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Loan_Documents = require("../../models/Loan/Loan_Documents");

// router.post("/", async (req, res) => {
//   try {
//     const uniqueId = `F${moment().format("YYYYMMDDHHmmss")}`;
//     const timestampForDocId = Date.now();
//     const uniqueIdForDocId = `${timestampForDocId}`;

//     req.body["file_id"] = uniqueId;
//     req.body["createdAt"] = moment()
//       .utcOffset(330)
//       .format("YYYY-MM-DD HH:mm:ss");
//     req.body["updatedAt"] = moment()
//       .utcOffset(330)
//       .format("YYYY-MM-DD HH:mm:ss");

//     var data = await File_Uplode.create(req.body);
//     res.json({
//       success: true,
//       data: data,
//       message: "Add Role Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const uniqueId = `F${moment().format("YYYYMMDDHHmmss")}`;
    const timestampForDocId = Date.now();

    req.body["file_id"] = uniqueId;
    req.body["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    req.body.documents.forEach((doc) => {
      doc.doc_id = `${timestampForDocId}_${Math.floor(Math.random() * 1000)}`;
    });

    var data = await File_Uplode.create(req.body);
    res.json({
      success: true,
      data: data,
      message: "Add Role Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    var data = await File_Uplode.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const branchuser_id = data[i].branchuser_id;
      const loan_id = data[i].loan_id;
      const loantype_id = data[i].loantype_id;

      const branchUserData = await SavajCapital_User.findOne({
        branchuser_id: branchuser_id,
      });
      const loanData = await Loan.findOne({
        loan_id: loan_id,
      });
      const loanTypeData = await Loan_Type.findOne({
        loantype_id: loantype_id,
      });

      if (branchUserData) {
        data[i].full_name = branchUserData.full_name;
      }
      if (loanData) {
        data[i].loan = loanData.loan;
      }
      if (loanTypeData) {
        data[i].loan_type = loanTypeData.loan_type;
      }
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
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

router.get("/file_upload/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;
    console.log("Looking for file with ID:", file_id);

    const fileData = await File_Uplode.findOne({ file_id: file_id });
    if (!fileData) {
      console.log("No file found with ID:", file_id);
      return res.status(404).json({ message: "File not found" });
    }
    console.log("File data retrieved:", fileData);

    const loan = await Loan.findOne({ loan_id: fileData.loan_id });
    if (!loan) {
      console.log("No loan found for loan ID:", fileData.loan_id);
      return res.status(404).json({ message: "Loan not found" });
    }

    const loanType = await Loan_Type.findOne({
      loantype_id: fileData.loantype_id,
    });
    if (!loanType) {
      console.log("No loan type found with ID:", fileData.loantype_id);
      return res.status(404).json({ message: "Loan type not found" });
    }

    const documentDetails = await Promise.all(
      fileData.documents.map(async (doc) => {
        const loanDocument = await Loan_Documents.findOne({
          loan_document_id: doc.loan_document_id,
        });
        return {
          file_path: doc.file_path,
          loan_document_id: doc.loan_document_id,
          doc_id: doc.doc_id,
          loan_document: loanDocument
            ? loanDocument.loan_document
            : "Document name not found",
        };
      })
    );

    const responseData = {
      file: {
        _id: fileData._id,
        user_id: fileData.user_id,
        loan_id: fileData.loan_id,
        loantype_id: fileData.loantype_id,
        file_id: fileData.file_id,
        loan: loan.loan,
        loan_type: loanType.loan_type,
        documents: documentDetails,
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
        __v: fileData.__v,
      },
    };

    res.json({
      statusCode: 200,
      data: responseData,
      message: "Loan details retrieved successfully",
    });
  } catch (error) {
    console.error("Error during data retrieval:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    // Attempt to find and delete the file using the file_id provided
    const deletedFile = await File_Uplode.findOneAndDelete({
      file_id: file_id,
    });

    // If no file is found and deleted, return a 404 not found response
    if (!deletedFile) {
      console.log(`No file found with ID: ${file_id}`);
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Successfully deleted the file, return success response
    console.log(`File deleted successfully: ${file_id}`);
    res.json({
      success: true,
      message: "File deleted successfully",
      deletedFileId: file_id, // Using the provided file_id as part of the response
    });
  } catch (error) {
    console.error(`Error when trying to delete file: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


module.exports = router;
