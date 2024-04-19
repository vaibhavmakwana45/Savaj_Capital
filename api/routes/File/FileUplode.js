const express = require("express");
const router = express.Router();
const moment = require("moment");
const File_Uplode = require("../../models/File/File_Uplode");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Loan_Documents = require("../../models/Loan/Loan_Documents");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const AddUser = require("../../models/AddUser");

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

// router.get("/", async (req, res) => {
//   try {
//     var data = await File_Uplode.aggregate([
//       {
//         $sort: { updatedAt: -1 },
//       },
//     ]);

//     for (let i = 0; i < data.length; i++) {
//       const branchuser_id = data[i].branchuser_id;
//       const loan_id = data[i].loan_id;
//       const loantype_id = data[i].loantype_id;

//       const branchUserData = await SavajCapital_User.findOne({
//         branchuser_id: branchuser_id,
//       });
//       const loanData = await Loan.findOne({
//         loan_id: loan_id,
//       });
//       const loanTypeData = await Loan_Type.findOne({
//         loantype_id: loantype_id,
//       });

//       if (branchUserData) {
//         data[i].full_name = branchUserData.full_name;
//       }
//       if (loanData) {
//         data[i].loan = loanData.loan;
//       }
//       if (loanTypeData) {
//         data[i].loan_type = loanTypeData.loan_type;
//       }

//       // Count the number of documents uploaded based on loantype_id
//       let documentCount;
//       if (loantype_id === "") {
//         // If loantype_id is empty, find the count based on loan_id
//         documentCount = await Loan_Documents.countDocuments({
//           loan_id: loan_id,
//         });
//       } else {
//         // If loantype_id is not empty, find the count based on loantype_id
//         documentCount = await Loan_Documents.countDocuments({
//           loantype_id: loantype_id,
//         });
//       }

//       // Calculate the percentage
//       const uploadedDocumentsCount = data[i].documents.length;
//       let percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(
//         2
//       ); // Limit to two decimal places

//       // Store the count and percentage in the document
//       data[i].document_count = documentCount;
//       data[i].document_percentage = parseFloat(percentage); // Convert back to float

//       // Count the number of documents uploaded by the user
//       data[i].uploaded_documents_count = uploadedDocumentsCount;
//     }

//     const count = data.length;

//     res.json({
//       statusCode: 200,
//       data: data,
//       count: count,
//       message: "Read All Request",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

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

      // Count the number of documents uploaded based on loantype_id
      let documentCount;
      if (loantype_id === "") {
        // If loantype_id is empty, find the count based on loan_id
        documentCount = await Loan_Documents.countDocuments({
          loan_id: loan_id,
        });
      } else {
        // If loantype_id is not empty, find the count based on loantype_id
        documentCount = await Loan_Documents.countDocuments({
          loantype_id: loantype_id,
        });
      }

      // Get the loan_document_ids based on the document_count
      let loan_doc_data;
      if (loantype_id === "") {
        // If loantype_id is empty, find documents based on loan_id
        loan_doc_data = await Loan_Documents.find({
          loan_id: loan_id,
        }).limit(documentCount);
      } else {
        // If loantype_id is not empty, find documents based on loantype_id
        loan_doc_data = await Loan_Documents.find({
          loantype_id: loantype_id,
        }).limit(documentCount);
      }

      // Extract loan_document_ids and add them to the object in data array
      data[i].loan_document_ids = loan_doc_data.map((doc) => ({
        loan_document_id: doc.loan_document_id,
        loan_document: doc.loan_document,
      }));

      // Check if loan_document_id exists in documents array and set is_uploaded accordingly
      data[i].loan_document_ids.forEach((doc) => {
        const found = data[i].documents.some(
          (d) => d.loan_document_id === doc.loan_document_id
        );
        doc.is_uploaded = found;
      });

      // Calculate the percentage
      const uploadedDocumentsCount = data[i].documents.length;
      let percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(
        2
      ); // Limit to two decimal places

      // Store the count and percentage in the document
      data[i].document_count = documentCount;
      data[i].document_percentage = parseFloat(percentage); // Convert back to float

      // Count the number of documents uploaded by the user
      data[i].uploaded_documents_count = uploadedDocumentsCount;
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

    const fileData = await File_Uplode.findOne({ file_id: file_id });

    const loan = await Loan.findOne({ loan_id: fileData.loan_id });

    const user = await AddUser.findOne({ user_id: fileData.user_id });

    const loanType = await Loan_Type.findOne({
      loantype_id: fileData?.loantype_id,
    });

    const savajcapitalbranch = await SavajCapital_Branch.findOne({
      branch_id: fileData.branch_id,
    });

    const savajcapitalbranchuser = await SavajCapital_User.findOne({
      branchuser_id: fileData.branchuser_id,
    });

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
        loantype_id: fileData?.loantype_id,
        file_id: fileData.file_id,
        loan: loan.loan,
        loan_type: loanType?.loan_type,
        username: user?.username,
        branch_name: savajcapitalbranch.branch_name,
        full_name: savajcapitalbranchuser.full_name,
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

router.get("/edit_file_upload/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const fileData = await File_Uplode.findOne({ file_id: file_id });

    if (!fileData) {
      console.log("No file found with ID:", file_id);
      return res.status(404).json({
        statusCode: 404,
        message: "File not found",
      });
    }
    const responseData = {
      fileDetails: fileData,
    };

    res.json({
      statusCode: 200,
      data: responseData,
      message: "File details retrieved successfully",
    });
  } catch (error) {
    console.error("Error during data retrieval:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});
router.delete("/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    const deletedFile = await File_Uplode.findOneAndDelete({
      file_id: file_id,
    });

    if (!deletedFile) {
      console.log(`No file found with ID: ${file_id}`);
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    console.log(`File deleted successfully: ${file_id}`);
    res.json({
      success: true,
      message: "File deleted successfully",
      deletedFileId: file_id,
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
