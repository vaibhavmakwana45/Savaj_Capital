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
const AddDocuments = require("../../models/AddDocuments/AddDocuments");
const Title = require("../../models/AddDocuments/Title");
const Loan_Step = require("../../models/Loan_Step/Loan_Step");
const BankApproval = require("../../models/Bank/BankApproval");
const SavajCapital_BranchAssign = require("../../models/Savaj_Capital/Branch_Assign");
const Compelete_Step = require("../../models/Loan_Step/Compelete_Step");

router.post("/", async (req, res) => {
  try {
    const { user_id, loan_id, loantype_id } = req.body;

    let query = { user_id, loan_id };
    if (loantype_id) {
      query.loantype_id = loantype_id;
    }

    const existingEntry = await File_Uplode.findOne(query);

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: "File already exists.",
      });
    }
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
      message: "Add File Successfully",
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
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     var data = await File_Uplode.aggregate([
//       {
//         $sort: { updatedAt: -1 },
//       },
//       {
//         $skip: skip,
//       },
//       {
//         $limit: limit,
//       },
//     ]);

//     // Loop through the data to populate additional fields
//     for (let i = 0; i < data.length; i++) {
//       const branchuser_id = data[i].branchuser_id;
//       const user_id = data[i].user_id;
//       const loan_id = data[i].loan_id;
//       const loantype_id = data[i].loantype_id;

//       const branchUserData = await SavajCapital_User.findOne({
//         branchuser_id: branchuser_id,
//       });

//       const userData = await AddUser.findOne({ user_id: user_id });
//       const loanData = await Loan.findOne({
//         loan_id: loan_id,
//       });
//       const loanTypeData = await Loan_Type.findOne({
//         loantype_id: loantype_id,
//       });

//       if (branchUserData) {
//         data[i].brachuser_full_name = branchUserData.full_name;
//       }

//       if (userData) {
//         data[i].user_username = userData.username;
//         data[i].pan_card = userData.pan_card;
//       }
//       if (loanData) {
//         data[i].loan = loanData.loan;
//       }
//       if (loanTypeData) {
//         data[i].loan_type = loanTypeData.loan_type;
//       }

//       let documentCount;
//       if (loantype_id === "") {
//         documentCount = await Loan_Documents.countDocuments({
//           loan_id: loan_id,
//         });
//       } else {
//         documentCount = await Loan_Documents.countDocuments({
//           loantype_id: loantype_id,
//         });
//       }

//       let loan_doc_data;
//       if (loantype_id === "") {
//         loan_doc_data = await Loan_Documents.find({
//           loan_id: loan_id,
//         }).limit(documentCount);
//       } else {
//         loan_doc_data = await Loan_Documents.find({
//           loantype_id: loantype_id,
//         }).limit(documentCount);
//       }

//       data[i].loan_document_ids = loan_doc_data.map((doc) => ({
//         loan_document_id: doc.loan_document_id,
//         loan_document: doc.loan_document,
//       }));

//       data[i].loan_document_ids.forEach((doc) => {
//         const found = data[i].documents.some(
//           (d) => d.loan_document_id === doc.loan_document_id
//         );
//         doc.is_uploaded = found;
//       });

//       // const uploadedDocumentsCount = data[i].documents.length;
//       // let percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(
//       //   2
//       // );

//       // data[i].document_count = documentCount;
//       // data[i].document_percentage = parseFloat(percentage);

//       // data[i].uploaded_documents_count = uploadedDocumentsCount;
//     }

//     // Query to fetch total count of documents
//     const totalCount = await File_Uplode.countDocuments();

//     // Calculate total page count
//     const totalPages = Math.ceil(totalCount / limit);

//     res.json({
//       statusCode: 200,
//       data: data,
//       count: totalCount,
//       totalPages: totalPages,
//       currentPage: page,
//       message: "Read All Request",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// Fast Responce with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch data with aggregation pipeline
    const data = await File_Uplode.aggregate([
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get IDs for parallel queries
    const branchUserIds = data.map((item) => item.branchuser_id);
    const userIds = data.map((item) => item.user_id);
    const loanIds = data.map((item) => item.loan_id);
    const loanTypeIds = data.map((item) => item.loantype_id);

    // Execute parallel queries
    const [
      branchUserData,
      userData,
      loanData,
      loanTypeData,
    ] = await Promise.all([
      SavajCapital_User.find({ branchuser_id: { $in: branchUserIds } }),
      AddUser.find({ user_id: { $in: userIds } }),
      Loan.find({ loan_id: { $in: loanIds } }),
      Loan_Type.find({ loantype_id: { $in: loanTypeIds } }),
    ]);

    // Create maps for faster lookup
    const branchUserMap = new Map(
      branchUserData.map((user) => [user.branchuser_id, user])
    );
    const userMap = new Map(userData.map((user) => [user.user_id, user]));
    const loanMap = new Map(loanData.map((loan) => [loan.loan_id, loan]));
    const loanTypeMap = new Map(
      loanTypeData.map((loanType) => [loanType.loantype_id, loanType])
    );

    // Fetch documents count for each loan/loantype
    const documentCounts = await Promise.all(
      data.map(async (item) => {
        const count = await Loan_Documents.countDocuments(
          item.loantype_id === ""
            ? { loan_id: item.loan_id }
            : { loantype_id: item.loantype_id }
        );
        return { itemId: item._id, count };
      })
    );

    // Fetch documents for each loan/loantype
    const documentData = await Promise.all(
      data.map(async (item) => {
        const docs = await Loan_Documents.find(
          item.loantype_id === ""
            ? { loan_id: item.loan_id }
            : { loantype_id: item.loantype_id }
        ).limit(item.documentCount);
        return { itemId: item._id, docs };
      })
    );

    // Combine fetched data with original data
    data.forEach((item) => {
      if (branchUserMap.has(item.branchuser_id)) {
        const branchUserData = branchUserMap.get(item.branchuser_id);
        item.brachuser_full_name = branchUserData.full_name;
      }
      if (userMap.has(item.user_id)) {
        const userData = userMap.get(item.user_id);
        item.user_username = userData.username;
        item.pan_card = userData.pan_card;
        item.businessname = userData.businessname;
        item.state = userData.state;
        item.city = userData.city;
      }
      if (loanMap.has(item.loan_id)) {
        const loanData = loanMap.get(item.loan_id);
        item.loan = loanData.loan;
      }
      if (loanTypeMap.has(item.loantype_id)) {
        const loanTypeData = loanTypeMap.get(item.loantype_id);
        item.loan_type = loanTypeData.loan_type;
      }

      // const documentCount = documentCounts.find(dc => dc.itemId === item._id)?.count || 0;
      // item.document_count = documentCount;

      // const uploadedDocumentsCount = documentData.find(dd => dd.itemId === item._id)?.docs.length || 0;
      // item.uploaded_documents_count = uploadedDocumentsCount;

      // const percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(2);
      // item.document_percentage = parseFloat(percentage);

      const loanDocs =
        documentData.find((dd) => dd.itemId === item._id)?.docs || [];
      item.loan_document_ids = loanDocs.map((doc) => ({
        loan_document_id: doc.loan_document_id,
        loan_document: doc?.loan_document,
        is_uploaded: item.documents.some(
          (d) => d.loan_document_id === doc.loan_document_id
        ),
      }));
    });

    // Query to fetch total count of documents
    const totalCount = await File_Uplode.countDocuments();

    // Calculate total page count
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      statusCode: 200,
      data,
      count: totalCount,
      totalPages,
      currentPage: page,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Without Pagination
// router.get("/", async (req, res) => {
//   try {
//     var data = await File_Uplode.aggregate([
//       {
//         $sort: { updatedAt: -1 },
//       },
//     ]);

//     for (let i = 0; i < data.length; i++) {
//       const branchuser_id = data[i].branchuser_id;
//       const user_id = data[i].user_id;
//       const loan_id = data[i].loan_id;
//       const loantype_id = data[i].loantype_id;

//       const branchUserData = await SavajCapital_User.findOne({
//         branchuser_id: branchuser_id,
//       });

//       const userData = await AddUser.findOne({ user_id: user_id });
//       const loanData = await Loan.findOne({
//         loan_id: loan_id,
//       });
//       const loanTypeData = await Loan_Type.findOne({
//         loantype_id: loantype_id,
//       });

//       if (branchUserData) {
//         data[i].brachuser_full_name = branchUserData.full_name;
//       }

//       if (userData) {
//         data[i].user_username = userData.username;
//         data[i].pan_card = userData.pan_card;
//       }
//       if (loanData) {
//         data[i].loan = loanData.loan;
//       }
//       if (loanTypeData) {
//         data[i].loan_type = loanTypeData.loan_type;
//       }

//       let documentCount;
//       if (loantype_id === "") {
//         documentCount = await Loan_Documents.countDocuments({
//           loan_id: loan_id,
//         });
//       } else {
//         documentCount = await Loan_Documents.countDocuments({
//           loantype_id: loantype_id,
//         });
//       }

//       let loan_doc_data;
//       if (loantype_id === "") {
//         loan_doc_data = await Loan_Documents.find({
//           loan_id: loan_id,
//         }).limit(documentCount);
//       } else {
//         loan_doc_data = await Loan_Documents.find({
//           loantype_id: loantype_id,
//         }).limit(documentCount);
//       }

//       data[i].loan_document_ids = loan_doc_data.map((doc) => ({
//         loan_document_id: doc.loan_document_id,
//         loan_document: doc.loan_document,
//       }));

//       data[i].loan_document_ids.forEach((doc) => {
//         const found = data[i].documents.some(
//           (d) => d.loan_document_id === doc.loan_document_id
//         );
//         doc.is_uploaded = found;
//       });

//       const uploadedDocumentsCount = data[i].documents.length;
//       let percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(
//         2
//       );

//       data[i].document_count = documentCount;
//       data[i].document_percentage = parseFloat(percentage);

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

// Assuming Title model is imported and available
router.get("/file_upload/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const fileData = await File_Uplode.findOne({ file_id: file_id });

    const loan = await Loan.findOne({ loan_id: fileData.loan_id });

    const user = await AddUser.findOne({ user_id: fileData.user_id });

    const loanType = await Loan_Type.findOne({
      loantype_id: fileData?.loantype_id,
    });

    const documentDetails = await Promise.all(
      fileData.documents.map(async (doc) => {
        const loanDocument = await Loan_Documents.findOne({
          loan_document_id: doc.loan_document_id,
        });

        const title = await Title.findOne({ title_id: doc.title_id });

        const documentName = await AddDocuments.findOne({
          document_id: doc.loan_document_id,
        });

        return {
          file_path: doc.file_path,
          loan_document_id: doc.loan_document_id,
          document_name: documentName
            ? documentName.document
            : "Document name not found",
          doc_id: doc.doc_id,
          title_id: doc.title_id,
          title: title ? title.title : "Title not found",
        };
      })
    );

    const groupedFiles = documentDetails.reduce((acc, curr) => {
      if (!acc[curr.title]) {
        acc[curr.title] = [];
      }
      acc[curr.title].push(curr);
      return acc;
    }, {});

    let arrayGroupFile = [];
    for (const key in groupedFiles) {
      if (groupedFiles.hasOwnProperty.call(groupedFiles, key)) {
        const element = groupedFiles[key];
        const titleData = await Loan_Documents.findOne({
          loan_id: fileData.loan_id,
          loantype_id: fileData?.loantype_id,
          title_id: element[0].title_id,
        });

        let index = titleData ? titleData.index : null;

        const data = {
          index: index,
          title: key,
          value: element,
        };
        arrayGroupFile.push(data);
      }
    }

    const filteredArrayGroupFile = arrayGroupFile.filter(
      (item) => item.index !== null
    );

    function compareIndexes(a, b) {
      if (a.index === null && b.index === null) return 0;
      if (a.index === null) return 1;
      if (b.index === null) return -1;
      return parseInt(a.index) - parseInt(b.index);
    }

    const sortedGroupFiles = filteredArrayGroupFile.sort(compareIndexes);

    const formattedData = {};
    sortedGroupFiles.forEach((item) => {
      formattedData[item.title] = item.value;
    });

    const responseData = {
      file: {
        _id: fileData._id,
        branch_id: fileData.branch_id,
        branchuser_id: fileData.branchuser_id,
        user_id: fileData.user_id,
        loan_id: fileData.loan_id,
        loantype_id: fileData?.loantype_id,
        file_id: fileData.file_id,
        loan: loan.loan,
        loan_type: loanType?.loan_type,
        user: user,
        documents: formattedData,
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

router.get("/abc/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const fileData = await File_Uplode.findOne({ file_id: file_id });

    const loan = await Loan.findOne({ loan_id: fileData.loan_id });

    const user = await AddUser.findOne({ user_id: fileData.user_id });

    const loanType = await Loan_Type.findOne({
      loantype_id: fileData?.loantype_id,
    });

    const loanStepDetails = await Promise.all(
      loan.loan_step_id.map(async (stepId) => {
        const loanStep = await Loan_Step.findOne({ loan_step_id: stepId });
        return {
          loan_step_id: stepId,
          loan_step: loanStep ? loanStep.loan_step : "Loan step not found",
        };
      })
    );

    const documentDetails = await Promise.all(
      fileData.documents.map(async (doc) => {
        const loanDocument = await Loan_Documents.findOne({
          loan_document_id: doc.loan_document_id,
        });

        const documentName = await AddDocuments.findOne({
          document_id: doc.loan_document_id,
        });

        return {
          file_path: doc.file_path,
          loan_document_id: doc.loan_document_id,
          document_name: documentName
            ? documentName.document
            : "Document name not found",
          doc_id: doc.doc_id,
          title_id: doc.title_id,
        };
      })
    );

    const groupedFiles = documentDetails.reduce((acc, curr) => {
      if (!acc[curr.title]) {
        acc[curr.title] = [];
      }
      acc[curr.title].push(curr);
      return acc;
    }, {});

    const responseData = {
      file: {
        _id: fileData._id,
        branch_id: fileData.branch_id,
        branchuser_id: fileData.branchuser_id,
        user_id: fileData.user_id,
        loan_id: fileData.loan_id,
        loantype_id: fileData?.loantype_id,
        file_id: fileData.file_id,
        loan: loan.loan,
        loan_step_id: loanStepDetails,
        loan_type: loanType?.loan_type,
        username: user?.username,
        documents: groupedFiles,
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

router.delete("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(fileId, "fileId");
    const fileAssignToSavajCapitalBranch = await SavajCapital_BranchAssign.findOne(
      {
        file_id: fileId,
      }
    );

    const fileAssignToBankApproval = await BankApproval.findOne({
      file_id: fileId,
    });

    if (fileAssignToSavajCapitalBranch || fileAssignToBankApproval) {
      return res.status(200).json({
        statusCode: 201,
        message: "File cannot be deleted because it is currently assigned.",
      });
    }

    const deletedFile = await File_Uplode.findOneAndDelete({
      file_id: fileId,
    });
    const deletedSteps = await Compelete_Step.deleteMany({ file_id: fileId });
    console.log(deletedSteps, "deletedSteps");

    if (!deletedFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.json({
      success: true,
      message: "File deleted successfully",
      deletedFileId: fileId,
    });
  } catch (error) {
    console.error(`Error when trying to delete file: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const updateData = req.body;

    if (updateData.documents && updateData.documents.length > 0) {
      const timestampForDocId = moment().unix();
      updateData.documents.forEach((doc, index) => {
        doc.doc_id = `${timestampForDocId}_${Math.floor(
          Math.random() * 1000
        )}_${index}`;
      });
    }

    updateData.updatedAt = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    const updatedFile = await File_Uplode.findOneAndUpdate(
      { file_id: file_id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({
        statusCode: 404,
        message: "File not found",
      });
    }

    res.json({
      statusCode: 200,
      success: true,
      message: "File updated successfully",
      data: updatedFile,
    });
  } catch (error) {
    console.error(`Error when trying to update file: ${error}`);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

router.get("/get/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;

    var data = await File_Uplode.aggregate([
      { $match: { branchuser_id: branchuser_id } },
      { $sort: { updatedAt: -1 } },
    ]).option({ maxTimeMS: 30000 });

    const branch = await SavajCapital_Branch.findOne({
      branchuser_id: data.branchuser_id,
    });

    for (let i = 0; i < data.length; i++) {
      const branchuser_id = data[i].branchuser_id;
      const user_id = data[i].user_id;
      const loan_id = data[i].loan_id;
      const loantype_id = data[i].loantype_id;

      const branchUserData = await SavajCapital_User.findOne({
        branchuser_id: branchuser_id,
      });

      const userData = await AddUser.findOne({ user_id: user_id });
      const loanData = await Loan.findOne({
        loan_id: loan_id,
      });
      const loanTypeData = await Loan_Type.findOne({
        loantype_id: loantype_id,
      });

      if (branchUserData) {
        data[i].brachuser_full_name = branchUserData.full_name;
      }

      if (userData) {
        data[i].user_username = userData.username;
      }
      if (loanData) {
        data[i].loan = loanData.loan;
      }
      if (loanTypeData) {
        data[i].loan_type = loanTypeData.loan_type;
      }

      let documentCount;
      if (loantype_id === "") {
        documentCount = await Loan_Documents.countDocuments({
          loan_id: loan_id,
        });
      } else {
        documentCount = await Loan_Documents.countDocuments({
          loantype_id: loantype_id,
        });
      }

      let loan_doc_data;
      if (loantype_id === "") {
        loan_doc_data = await Loan_Documents.find({
          loan_id: loan_id,
        }).limit(documentCount);
      } else {
        loan_doc_data = await Loan_Documents.find({
          loantype_id: loantype_id,
        }).limit(documentCount);
      }

      data[i].loan_document_ids = loan_doc_data.map((doc) => ({
        loan_document_id: doc.loan_document_id,
        loan_document: doc.loan_document,
      }));

      data[i].loan_document_ids.forEach((doc) => {
        const found = data[i].documents.some(
          (d) => d.loan_document_id === doc.loan_document_id
        );
        doc.is_uploaded = found;
      });

      const uploadedDocumentsCount = data[i].documents.length;
      let percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(
        2
      );

      data[i].document_count = documentCount;
      data[i].document_percentage = parseFloat(percentage);

      data[i].uploaded_documents_count = uploadedDocumentsCount;
    }

    const count = data.length;

    res.json({
      success: true,
      branch,
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

router.get("/allfiles", async (req, res) => {
  try {
    var data = await File_Uplode.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
    ]);

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

router.get("/testfile/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const data = await File_Uplode.findOne({ file_id });
    const loanIds = data.documents.map((item) => {
      return {
        loan_document_id: item.loan_document_id,
        title_id: item.title_id,
      };
    });

    const { loan_id, loantype_id } = data;
    const data2 = await Loan_Documents.find({ loan_id, loantype_id });
    const loanDocumentIds = data2.flatMap((item) => {
      return item.document_ids.map((loan_document_id) => {
        return {
          loan_document_id,
          title_id: item.title_id,
        };
      });
    });

    const commonIds = loanIds.filter((id) =>
      loanDocumentIds.some(
        (docId) =>
          docId.loan_document_id === id.loan_document_id &&
          docId.title_id === id.title_id
      )
    );

    const differentIds = loanDocumentIds.filter(
      (id) =>
        !loanIds.some(
          (docId) =>
            docId.loan_document_id === id.loan_document_id &&
            docId.title_id === id.title_id
        )
    );

    const approvedObject = [];
    const pendingObject = [];

    for (const item of commonIds) {
      const document = await AddDocuments.findOne({
        document_id: item.loan_document_id,
      });
      const title = await Title.findOne({
        title_id: item.title_id,
      });
      approvedObject.push({
        name: document.document,
        status: "Uploaded",
        title: title.title,
      });
    }

    for (const item of differentIds) {
      const document = await AddDocuments.findOne({
        document_id: item.loan_document_id,
      });
      const title = await Title.findOne({
        title_id: item.title_id,
      });
      pendingObject.push({
        name: document.document,
        status: "Pending",
        title: title.title,
      });
    }

    const diff = (approvedObject.length * 100) / loanDocumentIds.length;

    res.json({
      statusCode: 200,
      data: {
        approvedData: approvedObject,
        pendingData: pendingObject,
        file_id: file_id,
        document_percentage: parseInt(diff),
      },
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/get_documents/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const data = await File_Uplode.findOne({ file_id });
    const loanIds = data.documents.map((item) => {
      return {
        loan_document_id: item.loan_document_id,
        title_id: item.title_id,
      };
    });

    const { loan_id, loantype_id } = data;
    const data2 = await Loan_Documents.find({ loan_id, loantype_id });
    const loanDocumentIds = data2.flatMap((item) => {
      return item.document_ids.map((loan_document_id) => {
        return {
          loan_document_id,
          title_id: item.title_id,
        };
      });
    });

    const commonIds = loanIds.filter((id) =>
      loanDocumentIds.some(
        (docId) =>
          docId.loan_document_id === id.loan_document_id &&
          docId.title_id === id.title_id
      )
    );

    const differentIds = loanDocumentIds.filter(
      (id) =>
        !loanIds.some(
          (docId) =>
            docId.loan_document_id === id.loan_document_id &&
            docId.title_id === id.title_id
        )
    );

    const approvedObject = [];
    const pendingObject = [];

    for (const item of commonIds) {
      const document = await AddDocuments.findOne({
        document_id: item.loan_document_id,
      });
      approvedObject.push({
        name: document.document,
      });
    }

    for (const item of differentIds) {
      const document = await AddDocuments.findOne({
        document_id: item.loan_document_id,
      });
      pendingObject.push({
        name: document.document,
      });
    }

    res.json({
      statusCode: 200,
      data: {
        loan_step: "Documents",
        loan_step_id: "1715348523661",
        pendingData: pendingObject,
        status: pendingObject.length === 0 ? "complete" : "active",
      },
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/search", async (req, res) => {
//   const { search } = req.body;

//   try {
//     // Create a regex for partial matching
//     const regex = new RegExp(search, "i"); // 'i' for case-insensitive matching

//     // Find users matching the partially typed username
//     const users = await AddUser.find({ username: { $regex: regex } });

//     // If no users match the partial username, return empty result
//     if (users.length === 0) {
//       return res.json({ statusCode: 200, count: 0, data: [] });
//     }

//     // Fetch related data for each user
//     const results = [];
//     for (const user of users) {
//       const fileUploads = await File_Uplode.find({ user_id: user.user_id });
//       const loans = await Loan.find({ loan_id: { $in: fileUploads.map(file => file.loan_id) } });
//       const loanTypes = await Loan_Type.find({ loantype_id: { $in: fileUploads.map(file => file.loantype_id) } });

//       // Combine data
//       const userResults = fileUploads.map(file => {
//         const loan = loans.find(loan => loan.loan_id === file.loan_id);
//         const loanType = loanTypes.find(loanType => loanType.loantype_id === file.loantype_id);

//         return {
//           ...file.toObject(),
//           user_username: user.username,
//           businessname: user.businessname,
//           pan_card: user.pan_card,
//           city: user.city,
//           loan: loan ? loan.loan : null,
//           loan_type: loanType ? loanType.loan_type : null,
//         };
//       });

//       results.push(...userResults);
//     }

//     const count = results.length;

//     res.json({ statusCode: 200, count, data: results });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/search", async (req, res) => {
  const { search } = req.body;

  try {
    // Create a regex for partial matching
    const regex = new RegExp(search, "i"); // 'i' for case-insensitive matching

    // Find users matching the partially typed username
    const users = await AddUser.find({ username: { $regex: regex } });

    // If no users match the partial username, return empty result
    if (users.length === 0) {
      // Find matching file uploads using regex
      const fileUploads = await File_Uplode.find({
        $or: [
          { file_id: { $regex: regex } },
          { "documents.doc_id": { $regex: regex } },
        ],
      });

      const count = fileUploads.length;

      const fileIdResults = [];
      for (const file of fileUploads) {
        const user = await AddUser.findOne({ user_id: file.user_id });
        const loan = await Loan.findOne({ loan_id: file.loan_id });
        const loanType = await Loan_Type.findOne({
          loantype_id: file.loantype_id,
        });

        if (user) {
          fileIdResults.push({
            ...file.toObject(),
            user_username: user.username,
            businessname: user.businessname,
            pan_card: user.pan_card,
            city: user.city,
            loan: loan ? loan.loan : null,
            loan_type: loanType ? loanType.loan_type : null,
          });
        }
      }
      res.json({ statusCode: 200, count, data: fileIdResults });
    } else {
      // Extract user IDs
      const userIds = users.map((user) => user.user_id);

      // Find file uploads matching the partially typed file_id or documents.doc_id, for the found users
      const fileUploads = await File_Uplode.find({
        $or: [
          { user_id: { $in: userIds } },
          { file_id: { $regex: regex } },
          { "documents.doc_id": { $regex: regex } },
        ],
      });

      // Fetch related data for each user
      const results = [];
      for (const user of users) {
        const userFileUploads = fileUploads.filter(
          (file) => file.user_id === user.user_id
        );
        const loans = await Loan.find({
          loan_id: { $in: userFileUploads.map((file) => file.loan_id) },
        });
        const loanTypes = await Loan_Type.find({
          loantype_id: { $in: userFileUploads.map((file) => file.loantype_id) },
        });

        // Combine data
        const userResults = userFileUploads.map((file) => {
          const loan = loans.find((loan) => loan.loan_id === file.loan_id);
          const loanType = loanTypes.find(
            (loanType) => loanType.loantype_id === file.loantype_id
          );

          return {
            ...file.toObject(),
            user_username: user.username,
            businessname: user.businessname,
            pan_card: user.pan_card,
            city: user.city,
            loan: loan ? loan.loan : null,
            loan_type: loanType ? loanType.loan_type : null,
          };
        });

        results.push(...userResults);
      }

      const count = results.length;
      res.json({ statusCode: 200, count: count, data: results });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router.post("/search", async (req, res) => {
//   const { search } = req.body;

//   try {
//     // Create a regex for partial matching
//     const regex = new RegExp(search, "i"); // 'i' for case-insensitive matching

//     // Find matching file uploads using regex
//     const fileUploads = await File_Uplode.find({
//       $or: [
//         { file_id: { $regex: regex } },
//         { "documents.doc_id": { $regex: regex } },
//       ],
//     });

//     // Extract user IDs, loan IDs, and loan type IDs from file uploads
//     const userIds = fileUploads.map((file) => file.user_id);
//     const loanIds = fileUploads.map((loan) => loan.loan_id);
//     const loanTypeIds = fileUploads.map((loanType) => loanType.loantype_id);

//     // Query users, loans, and loan types based on extracted IDs
//     const users = await AddUser.find({ user_id: { $in: userIds } });
//     const loans = await Loan.find({ loan_id: { $in: loanIds } });
//     const loanTypes = await Loan_Type.find({
//       loantype_id: { $in: loanTypeIds },
//     });

//     // Combine file upload data with user, loan, and loan type data
//     const results = fileUploads.map((file) => {
//       const user = users.find((user) => user.user_id === file.user_id);
//       const loan = loans.find((loan) => loan.loan_id === file.loan_id);
//       const loanType = loanTypes.find(
//         (loanType) => loanType.loantype_id === file.loantype_id
//       );

//       return {
//         ...file.toObject(),
//         user_username: user ? user.username : null,
//         businessname: user ? user.businessname : null,
//         pan_card: user ? user.pan_card : null,
//         city: user ? user.city : null,
//         loan: loan ? loan.loan : null,
//         loan_type: loanType ? loanType.loan_type : null,
//       };
//     });

//     const count = results.length;

//     res.json({ statusCode: 200, count: count, data: results });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.put("/updatestatus/:fileId", async (req, res) => {
  try {
    const { status } = req.body;
    const { fileId } = req.params;

    const validStatuses = ["running", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be 'running', 'approved', or 'rejected'.",
      });
    }

    const updatedFile = await File_Uplode.findOneAndUpdate(
      { file_id: fileId },
      {
        $set: {
          status: status,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    res.json({
      success: true,
      data: updatedFile,
      message: "File status updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/filter", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.loan_id) {
      pipeline.push({
        $match: { loan_id: req.body.loan_id },
      });
    }

    pipeline.push({
      $facet: {
        data: [{ $match: {} }], // No pagination, returns all documents matching the query
        totalCount: [{ $count: "count" }],
      },
    });

    let result = await File_Uplode.aggregate(pipeline);

    // Extracting the inner "data" array from the result
    const filteredData = result[0]?.data || [];

    for (let i = 0; i < filteredData.length; i++) {
      const user_id = filteredData[i].user_id;
      const loan_id = filteredData[i].loan_id;
      const loantype_id = filteredData[i].loantype_id;

      const userData = await AddUser.findOne({ user_id: user_id });
      const loanData = await Loan.findOne({ loan_id: loan_id });
      const loanTypeData = await Loan_Type.findOne({
        loantype_id: loantype_id,
      });
      if (userData) {
        filteredData[i].user_username = userData.username;
        filteredData[i].city = userData.city;
        filteredData[i].businessname = userData.businessname;
        filteredData[i].pan_card = userData.pan_card;
      }

      if (loanData) {
        filteredData[i].loan = loanData.loan;
      }
      if (loanTypeData) {
        filteredData[i].loan_type = loanTypeData.loan_type;
      }
    }

    const count = filteredData.length;

    res.json({
      statusCode: 200,
      count: count,
      data: filteredData, // Sending only the inner "data" array
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/status", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.status) {
      pipeline.push({
        $match: { status: req.body.status },
      });
    }

    pipeline.push({
      $facet: {
        data: [{ $match: {} }], // No pagination, returns all documents matching the query
        // totalCount: [{ $count: "count" }],
      },
    });

    let result = await File_Uplode.aggregate(pipeline);

    // Extracting the inner "data" array from the result
    const filteredData = result[0]?.data || [];

    for (let i = 0; i < filteredData.length; i++) {
      const user_id = filteredData[i].user_id;
      const loan_id = filteredData[i].loan_id;
      const loantype_id = filteredData[i].loantype_id;

      const userData = await AddUser.findOne({ user_id: user_id });
      const loanData = await Loan.findOne({ loan_id: loan_id });
      const loanTypeData = await Loan_Type.findOne({
        loantype_id: loantype_id,
      });
      if (userData) {
        filteredData[i].user_username = userData.username;
        filteredData[i].city = userData.city;
        filteredData[i].businessname = userData.businessname;
        filteredData[i].pan_card = userData.pan_card;
      }

      if (loanData) {
        filteredData[i].loan = loanData.loan;
      }
      if (loanTypeData) {
        filteredData[i].loan_type = loanTypeData.loan_type;
      }
    }

    const count = filteredData.length;

    res.json({
      statusCode: 200,
      count: count,
      data: filteredData, // Sending only the inner "data" array
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/city_filter", async (req, res) => {
  const { city } = req.body;

  try {
    // Create a regex for partial matching
    const regex = new RegExp(city, "i"); // 'i' for case-insensitive matching

    // Find users matching the partially typed city
    const users = await AddUser.find({ city: { $regex: regex } });
    // Extract user IDs
    const userIds = users.map((user) => user.user_id);

    // Find file uploads matching the partially typed file_id or documents.doc_id, for the found users
    const fileUploads = await File_Uplode.find({
      $or: [
        { user_id: { $in: userIds } },
        { file_id: { $regex: regex } },
        { "documents.doc_id": { $regex: regex } },
      ],
    });

    // Fetch related data for each user
    const results = [];
    for (const user of users) {
      const userFileUploads = fileUploads.filter(
        (file) => file.user_id === user.user_id
      );
      const loans = await Loan.find({
        loan_id: { $in: userFileUploads.map((file) => file.loan_id) },
      });
      const loanTypes = await Loan_Type.find({
        loantype_id: { $in: userFileUploads.map((file) => file.loantype_id) },
      });

      // Combine data
      const userResults = userFileUploads.map((file) => {
        const loan = loans.find((loan) => loan.loan_id === file.loan_id);
        const loanType = loanTypes.find(
          (loanType) => loanType.loantype_id === file.loantype_id
        );

        return {
          ...file.toObject(),
          user_username: user.username,
          businessname: user.businessname,
          pan_card: user.pan_card,
          state: user.state,
          city: user.city,
          loan: loan ? loan.loan : null,
          loan_type: loanType ? loanType.loan_type : null,
        };
      });

      results.push(...userResults);
    }

    const count = results.length;
    res.json({ statusCode: 200, count, data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/state_filter", async (req, res) => {
  const { state } = req.body;

  try {
    // Create a regex for partial matching
    const regex = new RegExp(state, "i"); // 'i' for case-insensitive matching

    // Find users matching the partially typed state
    const users = await AddUser.find({ state: { $regex: regex } });
    // Extract user IDs
    const userIds = users.map((user) => user.user_id);

    // Find file uploads matching the partially typed file_id or documents.doc_id, for the found users
    const fileUploads = await File_Uplode.find({
      $or: [
        { user_id: { $in: userIds } },
        { file_id: { $regex: regex } },
        { "documents.doc_id": { $regex: regex } },
      ],
    });

    // Fetch related data for each user
    const results = [];
    for (const user of users) {
      const userFileUploads = fileUploads.filter(
        (file) => file.user_id === user.user_id
      );
      const loans = await Loan.find({
        loan_id: { $in: userFileUploads.map((file) => file.loan_id) },
      });
      const loanTypes = await Loan_Type.find({
        loantype_id: { $in: userFileUploads.map((file) => file.loantype_id) },
      });

      // Combine data
      const userResults = userFileUploads.map((file) => {
        const loan = loans.find((loan) => loan.loan_id === file.loan_id);
        const loanType = loanTypes.find(
          (loanType) => loanType.loantype_id === file.loantype_id
        );

        return {
          ...file.toObject(),
          user_username: user.username,
          businessname: user.businessname,
          pan_card: user.pan_card,
          state: user.state,
          city: user.city,
          loan: loan ? loan.loan : null,
          loan_type: loanType ? loanType.loan_type : null,
        };
      });

      results.push(...userResults);
    }

    const count = results.length;
    res.json({ statusCode: 200, count, data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
