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
const Guarantor_Step = require("../../models/AddGuarantor/GuarantorStep");
const Guarantor = require("../../models/AddGuarantor/AddGuarantor");

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

router.get("/", async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const dataPerPage = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm
      ? req.query.searchTerm.toLowerCase()
      : "";
    const selectedLoan = req.query.selectedLoan || "";
    const selectedStatus = req.query.selectedStatus
      ? req.query.selectedStatus.toLowerCase()
      : "";
    const selectedState = req.query.selectedState || "";
    const selectedCity = req.query.selectedCity || "";

    const matchStage = {};

    if (searchTerm) {
      matchStage.$or = [
        { file_id: { $regex: searchTerm, $options: "i" } },
        { loan_type: { $regex: searchTerm, $options: "i" } },
      ];

      const userData = await AddUser.find({
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { businessname: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("user_id");

      const filteredUserIds = userData.map((user) => user.user_id);
      matchStage.$or.push({ user_id: { $in: filteredUserIds } });
    }

    if (selectedLoan !== "all loan types" && selectedLoan !== "") {
      matchStage.loan_id = selectedLoan;
    }

    if (selectedStatus) {
      matchStage.status = { $regex: selectedStatus, $options: "i" };
    }

    if (selectedState || selectedCity) {
      const filter = { user_id: { $exists: true } };
      if (selectedState) filter.state = selectedState;
      if (selectedCity) filter.city = selectedCity;

      const userData = await AddUser.find(filter).select("user_id");
      const filteredUserIds = userData.map((user) => user.user_id);
      matchStage.user_id = { $in: filteredUserIds };
    }

    const totalDataCount = await File_Uplode.countDocuments(matchStage);
    const pipeline = [
      { $match: matchStage },
      { $sort: { updatedAt: -1 } },
      { $skip: (currentPage - 1) * dataPerPage },
      { $limit: dataPerPage },
    ];

    const data = await File_Uplode.aggregate(pipeline);

    const branchUserIds = data.map((item) => item.branchuser_id);
    const userIds = data.map((item) => item.user_id);
    const loanIds = data.map((item) => item.loan_id);
    const loanTypeIds = data.map((item) => item.loantype_id);
    const fileIds = data.map((item) => item.file_id);

    const [
      branchUserData,
      userData,
      loanData,
      loanTypeData,
      statusMessages,
      amountData,
      documentData,
      countData,
    ] = await Promise.all([
      SavajCapital_User.find({ branchuser_id: { $in: branchUserIds } }).select(
        "branchuser_id full_name"
      ),
      AddUser.find({ user_id: { $in: userIds } }).select(
        "user_id username pan_card businessname state city"
      ),
      Loan.find({ loan_id: { $in: loanIds } }).select("loan_id loan"),
      Loan_Type.find({ loantype_id: { $in: loanTypeIds } }).select(
        "loantype_id loan_type"
      ),
      Compelete_Step.find({ file_id: { $in: fileIds } }).select(
        "file_id statusMessage"
      ),
      Compelete_Step.find({ loan_step_id: "1715348798228" }).select(
        "file_id inputs"
      ),
      Promise.all(
        data.map(async (item) => {
          const docs = await Loan_Documents.find(
            item.loantype_id === ""
              ? { loan_id: item.loan_id }
              : { loantype_id: item.loantype_id }
          )
            .select("loan_document_id loan_document")
            .limit(item.documentCount);
          return { itemId: item._id, docs };
        })
      ),
      Promise.all(
        fileIds.map(async (file_id) => {
          const fileData = await File_Uplode.findOne({ file_id });
          const loanIds = fileData.documents.map((doc) => ({
            loan_document_id: doc.loan_document_id,
            title_id: doc.title_id,
          }));
          const data2 = await Loan_Documents.find({
            loan_id: fileData.loan_id,
            loantype_id: fileData.loantype_id,
          });
          const loanDocumentIds = data2.flatMap((doc) =>
            doc.document_ids.map((id) => ({
              loan_document_id: id,
              title_id: doc.title_id,
            }))
          );
          const commonIds = loanIds.filter((id) =>
            loanDocumentIds.some(
              (docId) =>
                docId.loan_document_id === id.loan_document_id &&
                docId.title_id === id.title_id
            )
          );
          const approvedCount = commonIds.length;
          const totalCount = loanDocumentIds.length;
          const documentPercentage = parseInt(
            (approvedCount * 100) / totalCount
          );
          return {
            file_id,
            document_percentage: documentPercentage,
          };
        })
      ),
    ]);

    const branchUserMap = new Map(
      branchUserData.map((user) => [user.branchuser_id, user])
    );
    const userMap = new Map(userData.map((user) => [user.user_id, user]));
    const loanMap = new Map(loanData.map((loan) => [loan.loan_id, loan]));
    const loanTypeMap = new Map(
      loanTypeData.map((loanType) => [loanType.loantype_id, loanType])
    );
    const statusMessageMap = new Map(
      statusMessages.map((status) => [status.file_id, status.statusMessage])
    );
    const amountMap = new Map(
      amountData.map((step) => {
        const dispatchAmountInput = step.inputs.find(
          (input) => input.label === "DISPATCH AMOUNT"
        );
        return [step.file_id, dispatchAmountInput?.value];
      })
    );
    for (const item of data) {
      item.branchuser_full_name =
        branchUserMap.get(item.branchuser_id)?.full_name || "";
      item.user_username = userMap.get(item.user_id)?.username || "";
      item.pan_card = userMap.get(item.user_id)?.pan_card || "";
      item.businessname = userMap.get(item.user_id)?.businessname || "";
      item.state = userMap.get(item.user_id)?.state || "";
      item.city = userMap.get(item.user_id)?.city || "";
      item.loan = loanMap.get(item.loan_id)?.loan || "";
      item.loan_type = loanTypeMap.get(item.loantype_id)?.loan_type || "";
      item.status_message = statusMessageMap.get(item.file_id) || "";
      item.amount = amountMap.get(item.file_id) || "";

      const loanDocs =
        documentData.find((dd) => dd.itemId === item._id)?.docs || [];
      item.loan_document_ids = loanDocs.map((doc) => ({
        loan_document_id: doc.loan_document_id,
        loan_document: doc?.loan_document,
        is_uploaded: item.documents.some(
          (d) => d.loan_document_id === doc.loan_document_id
        ),
      }));

      const countInfo = countData.find((info) => info.file_id === item.file_id);
      if (countInfo) {
        item.document_percentage = countInfo.document_percentage;
      }
    }

    res.json({
      statusCode: 200,
      data,
      totalPages: Math.ceil(totalDataCount / dataPerPage),
      currentPage,
      totalCount: totalDataCount,
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/savajusers/:state/:city", async (req, res) => {
  try {
    const { state, city } = req.params;
    const currentPage = parseInt(req.query.page) || 1;
    const dataPerPage = parseInt(req.query.limit) || 10;

    const searchTerm = req.query.searchTerm
      ? req.query.searchTerm.toLowerCase()
      : "";
    const selectedLoan = req.query.selectedLoan || "";
    const selectedStatus = req.query.selectedStatus
      ? req.query.selectedStatus.toLowerCase()
      : "";

    const matchStage = {};

    if (searchTerm) {
      matchStage.$or = [
        { file_id: { $regex: searchTerm, $options: "i" } },
        { loan_type: { $regex: searchTerm, $options: "i" } },
      ];

      const userData = await AddUser.find({
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { businessname: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("user_id");

      const filteredUserIds = userData.map((user) => user.user_id);
      matchStage.$or.push({ user_id: { $in: filteredUserIds } });
    }

    if (selectedLoan !== "all loan types" && selectedLoan !== "") {
      matchStage.loan_id = selectedLoan;
    }

    if (selectedStatus) {
      matchStage.status = { $regex: selectedStatus, $options: "i" };
    }
    const matchStageStateCity = { state, city };

    const users = await AddUser.find(matchStageStateCity);

    const userIds = users.map((user) => user.user_id);

    const fileMatchStage = { user_id: { $in: userIds } };

    const totalDataCount = await File_Uplode.countDocuments(fileMatchStage);

    const pipeline = [
      {
        $match: {
          ...fileMatchStage,
          ...matchStage,
        },
      },
      { $sort: { updatedAt: -1 } },
      { $skip: (currentPage - 1) * dataPerPage },
      { $limit: dataPerPage },
    ];

    const data = await File_Uplode.aggregate(pipeline);

    const branchUserIds = data.map((item) => item.branchuser_id);
    // const userIds = data.map((item) => item.user_id);
    const loanIds = data.map((item) => item.loan_id);
    const loanTypeIds = data.map((item) => item.loantype_id);
    const fileIds = data.map((item) => item.file_id);

    const [
      branchUserData,
      userData,
      loanData,
      loanTypeData,
      statusMessages,
      amountData,
      documentData,
      countData,
    ] = await Promise.all([
      SavajCapital_User.find({ branchuser_id: { $in: branchUserIds } }).select(
        "branchuser_id full_name"
      ),
      AddUser.find({ user_id: { $in: userIds } }).select(
        "user_id username pan_card businessname state city"
      ),
      Loan.find({ loan_id: { $in: loanIds } }).select("loan_id loan"),
      Loan_Type.find({ loantype_id: { $in: loanTypeIds } }).select(
        "loantype_id loan_type"
      ),
      Compelete_Step.find({ file_id: { $in: fileIds } }).select(
        "file_id statusMessage"
      ),
      Compelete_Step.find({ loan_step_id: "1715348798228" }).select(
        "file_id inputs"
      ),
      Promise.all(
        data.map(async (item) => {
          const docs = await Loan_Documents.find(
            item.loantype_id === ""
              ? { loan_id: item.loan_id }
              : { loantype_id: item.loantype_id }
          )
            .select("loan_document_id loan_document")
            .limit(item.documentCount);
          return { itemId: item._id, docs };
        })
      ),
      Promise.all(
        fileIds.map(async (file_id) => {
          const fileData = await File_Uplode.findOne({ file_id });
          const loanIds = fileData.documents.map((doc) => ({
            loan_document_id: doc.loan_document_id,
            title_id: doc.title_id,
          }));
          const data2 = await Loan_Documents.find({
            loan_id: fileData.loan_id,
            loantype_id: fileData.loantype_id,
          });
          const loanDocumentIds = data2.flatMap((doc) =>
            doc.document_ids.map((id) => ({
              loan_document_id: id,
              title_id: doc.title_id,
            }))
          );
          const commonIds = loanIds.filter((id) =>
            loanDocumentIds.some(
              (docId) =>
                docId.loan_document_id === id.loan_document_id &&
                docId.title_id === id.title_id
            )
          );
          const approvedCount = commonIds.length;
          const totalCount = loanDocumentIds.length;
          const documentPercentage = parseInt(
            (approvedCount * 100) / totalCount
          );
          return {
            file_id,
            document_percentage: documentPercentage,
          };
        })
      ),
    ]);

    const branchUserMap = new Map(
      branchUserData.map((user) => [user.branchuser_id, user])
    );
    const userMap = new Map(userData.map((user) => [user.user_id, user]));
    const loanMap = new Map(loanData.map((loan) => [loan.loan_id, loan]));
    const loanTypeMap = new Map(
      loanTypeData.map((loanType) => [loanType.loantype_id, loanType])
    );
    const statusMessageMap = new Map(
      statusMessages.map((status) => [status.file_id, status.statusMessage])
    );
    const amountMap = new Map(
      amountData.map((step) => {
        const dispatchAmountInput = step.inputs.find(
          (input) => input.label === "DISPATCH AMOUNT"
        );
        return [step.file_id, dispatchAmountInput?.value];
      })
    );
    for (const item of data) {
      item.branchuser_full_name =
        branchUserMap.get(item.branchuser_id)?.full_name || "";
      item.user_username = userMap.get(item.user_id)?.username || "";
      item.pan_card = userMap.get(item.user_id)?.pan_card || "";
      item.businessname = userMap.get(item.user_id)?.businessname || "";
      item.state = userMap.get(item.user_id)?.state || "";
      item.city = userMap.get(item.user_id)?.city || "";
      item.loan = loanMap.get(item.loan_id)?.loan || "";
      item.loan_type = loanTypeMap.get(item.loantype_id)?.loan_type || "";
      item.status_message = statusMessageMap.get(item.file_id) || "";
      item.amount = amountMap.get(item.file_id) || "";

      const loanDocs =
        documentData.find((dd) => dd.itemId === item._id)?.docs || [];
      item.loan_document_ids = loanDocs.map((doc) => ({
        loan_document_id: doc.loan_document_id,
        loan_document: doc?.loan_document,
        is_uploaded: item.documents.some(
          (d) => d.loan_document_id === doc.loan_document_id
        ),
      }));

      const countInfo = countData.find((info) => info.file_id === item.file_id);
      if (countInfo) {
        item.document_percentage = countInfo.document_percentage;
      }
    }

    res.json({
      statusCode: 200,
      data,
      totalPages: Math.ceil(totalDataCount / dataPerPage),
      currentPage,
      totalCount: totalDataCount,
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

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
    await Compelete_Step.deleteMany({
      file_id: fileId,
    });
    await Guarantor_Step.deleteMany({
      file_id: fileId,
    });
    await Guarantor.deleteMany({
      file_id: fileId,
    });

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

router.get("/file-count/:file_id", async (req, res) => {
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

router.get("/amounts/:loan_id/:loantype_id?", async (req, res) => {
  try {
    const { loan_id, loantype_id } = req.params;

    // Build query based on presence of loantype_id
    const query = { loan_id, status: "approved" };
    if (loantype_id) {
      query.loantype_id = loantype_id;
    }

    // Find approved files based on query
    const approvedFiles = await File_Uplode.find(query);
    const fileIds = approvedFiles.map((file) => file.file_id);
    const userIds = approvedFiles.map((file) => file.user_id);

    // Fetch user details
    const users = await AddUser.find({ user_id: { $in: userIds } });
    const userStatesCities = users.map((user) => ({
      user_id: user.user_id,
      state: user.state,
      city: user.city,
    }));

    // Fetch completed steps
    const completedSteps = await Compelete_Step.find({
      file_id: { $in: fileIds },
      loan_step_id: "1715348798228",
    });

    // Calculate amounts based on completed steps
    const amounts = completedSteps.map((step) => {
      const user = userStatesCities.find(
        (user) => user.user_id === step.user_id
      );
      return {
        amount: parseFloat(
          step.inputs.find((input) => input.label === "DISPATCH AMOUNT").value
        ),
        state: user?.state,
        city: user?.city,
      };
    });

    // Filter amounts based on state and city if provided
    const { state, city } = req.query;
    const filteredAmounts = amounts.filter((amount) => {
      return (
        (!state || amount.state === state) && (!city || amount.city === city)
      );
    });

    // Calculate total amount
    const totalAmount = filteredAmounts.reduce(
      (total, item) => total + item.amount,
      0
    );

    res.json({
      statusCode: 200,
      totalAmount,
      loantype_id,
      message: "Total amount for approved files fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

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

module.exports = router;
