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
const BranchAssign = require("../../models/Savaj_Capital/Branch_Assign");
const axios = require("axios");
const LoanStatus = require("../../models/AddDocuments/LoanStatus");
const emailService = require("../emailService");
const BankUser = require("../../models/Bank/BankUserSchema");
const Bank = require("../../models/Bank/BankSchema");
const crypto = require("crypto");

const decrypt = (text) => {
  const isEncrypted = /[0-9A-Fa-f]{6}/.test(text);

  if (isEncrypted) {
    const decipher = crypto.createDecipher("aes-256-cbc", "vaibhav");
    let decrypted = decipher.update(text, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } else {
    return text;
  }
};

router.post("/", async (req, res) => {
  try {
    // const { user_id, loan_id, loantype_id } = req.body;

    // let query = { user_id, loan_id };
    // if (loantype_id) {
    //   query.loantype_id = loantype_id;
    // }

    // const existingEntry = await File_Uplode.findOne(query);

    // if (existingEntry) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "File already exists.",
    //   });
    // }
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

    const logEntry = {
      log_id: `${moment().unix()}_${Math.floor(Math.random() * 1000)}`,
      message: "File created",
      timestamp: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    };

    req.body.logs = [logEntry];

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
    const searchTerm = req.query.searchTerm?.toLowerCase() || "";
    const selectedLoan = req.query.selectedLoan || "";
    const selectedLoanSubType = req.query.selectedSubtype || "";
    const selectedStatus = req.query.selectedStatus?.toLowerCase() || "";
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

    if (selectedLoan && selectedLoan !== "all loan types") {
      matchStage.loan_id = selectedLoan;
    }
    if (selectedLoanSubType) {
      matchStage.loantype_id = selectedLoanSubType;
    }
    if (selectedStatus) {
      matchStage.status = { $regex: selectedStatus, $options: "i" };
    }

    if (selectedState || selectedCity) {
      const filter = {};
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
      {
        $lookup: {
          from: "allusers",
          localField: "user_id",
          foreignField: "user_id",
          as: "user_data",
        },
      },
      {
        $lookup: {
          from: "loans",
          localField: "loan_id",
          foreignField: "loan_id",
          as: "loan_data",
        },
      },
      {
        $lookup: {
          from: "loan-types",
          localField: "loantype_id",
          foreignField: "loantype_id",
          as: "loan_type_data",
        },
      },
      {
        $lookup: {
          from: "complete_steps",
          localField: "file_id",
          foreignField: "file_id",
          as: "complete_steps",
        },
      },
      {
        $lookup: {
          from: "loanstatuses",
          localField: "status",
          foreignField: "loanstatus_id",
          as: "loan_status_data",
        },
      },
      {
        $lookup: {
          from: "loan_steps",
          localField: "loan_step_id",
          foreignField: "loan_step_id",
          as: "loan_steps_data",
        },
      },
      {
        $lookup: {
          from: "loan-documents",
          let: { loan_id: "$loan_id", loantype_id: "$loantype_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$loan_id", "$$loan_id"] },
                    { $eq: ["$loantype_id", "$$loantype_id"] },
                  ],
                },
              },
            },
            { $unwind: "$document_ids" },
          ],
          as: "loan_documents_data",
        },
      },
    ];

    const data = await File_Uplode.aggregate(pipeline);

    const userMap = new Map(
      data.flatMap((item) => item.user_data.map((user) => [user.user_id, user]))
    );
    const loanMap = new Map(
      data.flatMap((item) => item.loan_data.map((loan) => [loan.loan_id, loan]))
    );
    const loanTypeMap = new Map(
      data.flatMap((item) =>
        item.loan_type_data.map((loanType) => [loanType.loantype_id, loanType])
      )
    );
    const statusMessageMap = new Map();
    const amountMap = new Map();
    const loanStatusMap = new Map(
      data.flatMap((item) =>
        item.loan_status_data.map((status) => [
          status.loanstatus_id.toString(),
          status,
        ])
      )
    );

    data.forEach((item) => {
      item.complete_steps.forEach((step) => {
        if (step.statusMessage) {
          statusMessageMap.set(step.file_id, step.statusMessage);
        }
        if (step.loan_step_id === "1715348798228") {
          const dispatchAmountInput = step.inputs.find(
            (input) => input.label === "DISPATCH AMOUNT"
          );
          if (dispatchAmountInput) {
            amountMap.set(step.file_id, dispatchAmountInput.value);
          }
        }
      });
    });

    const loanSteps = await Loan_Step.find({}).lean();
    const loanStepsMap = new Map(
      loanSteps.map((step) => [step.loan_step_id, step])
    );

    const loanDocuments = await Loan_Documents.find({}).lean();
    const loanDocumentsMap = new Map(
      loanDocuments.map((doc) => [doc.loan_document_id, doc])
    );

    const stepsPromises = data.map(async (item) => {
      const file = item;
      const loan = loanMap.get(file.loan_id);

      if (!file || !loan) return;

      const steps = loan.loan_step_id.map((loan_step_id) => {
        const stepData = loanStepsMap.get(loan_step_id);
        if (!stepData) return null;

        if (loan_step_id === "1715348523661") {
          const loanIds = file.documents.map((item) => ({
            loan_document_id: item.loan_document_id,
            title_id: item.title_id,
          }));

          const { loan_id, loantype_id } = file;
          const data2 = loanDocuments.filter(
            (doc) => doc.loan_id === loan_id && doc.loantype_id === loantype_id
          );

          const loanDocumentIds = data2.flatMap((item) =>
            item.document_ids.map((loan_document_id) => ({
              loan_document_id,
              title_id: item.title_id,
            }))
          );

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
            const document = loanDocumentsMap.get(item.loan_document_id);
            approvedObject.push({
              name: document?.loan_document,
            });
          }

          for (const item of differentIds) {
            const document = loanDocumentsMap.get(item.loan_document_id);
            pendingObject.push({
              name: document?.loan_document,
            });
          }

          const documentStatus =
            pendingObject.length > 0
              ? "active"
              : approvedObject.length === 0
              ? "active"
              : "complete";

          return { loan_step: stepData?.loan_step, status: documentStatus };
        } else {
          const completedStep = file.complete_steps.find(
            (step) => step.loan_step_id === loan_step_id
          );

          let status = "active";
          if (completedStep) {
            status = completedStep.status;
          }

          return { loan_step: stepData?.loan_step, status };
        }
      });

      const filteredSteps = steps.filter((step) => step !== null);

      const rejectedStep = filteredSteps.find(
        (step) => step.status === "reject"
      );
      const activeStep = filteredSteps.find((step) => step.status === "active");

      if (rejectedStep) {
        item.running_step_name = rejectedStep?.loan_step;
      } else if (activeStep) {
        item.running_step_name = activeStep?.loan_step;
      } else {
        const lastIndex = filteredSteps.length - 1;
        item.running_step_name = filteredSteps[lastIndex]?.loan_step;
      }
    });

    await Promise.all(stepsPromises);

    for (const item of data) {
      item.user_username = userMap.get(item.user_id)?.username || "";
      item.pan_card = userMap.get(item.user_id)?.pan_card || "";
      item.businessname = userMap.get(item.user_id)?.businessname || "";
      item.state = userMap.get(item.user_id)?.state || "";
      item.city = userMap.get(item.user_id)?.city || "";
      item.loan = loanMap.get(item.loan_id)?.loan || "";
      item.loan_type = loanTypeMap.get(item.loantype_id)?.loan_type || "";
      item.status_message = statusMessageMap.get(item.file_id) || "";
      item.amount = amountMap.get(item.file_id) || "";

      if (loanStatusMap.has(item.status)) {
        const loanStatus = loanStatusMap.get(item.status);
        item.status = loanStatus.loanstatus;
        item.color = loanStatus.color;
      }

      const approvedCount = item.documents.filter((doc) =>
        item.loan_documents_data.some(
          (c) => c.document_ids === doc.loan_document_id
        )
      ).length;

      const totalCount = item.loan_documents_data.length;
      const documentPercentage = parseInt((approvedCount * 100) / totalCount);

      item.document_percentage = documentPercentage;
    }

    const responseData = data.map((item) => ({
      document_percentage: item.document_percentage,
      color: item.color,
      amount: item.amount,
      status_message: item.status_message,
      loan_type: item.loan_type,
      loan: item.loan,
      user_username: item.user_username,
      businessname: item.businessname,
      running_step_name: item.running_step_name,
      status: item.status,
      file_id: item.file_id,
      city: item.city,
      user_id: item.user_id,
      loan_id: item.loan_id,
      loantype_id: item.loantype_id,
    }));

    res.json({
      statusCode: 200,
      data: responseData,
      totalPages: Math.ceil(totalDataCount / dataPerPage),
      currentPage,
      totalCount: totalDataCount,
      message: "Read All Request",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/get_all_steps/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    const [file, loan] = await Promise.all([
      File_Uplode.findOne({ file_id }).lean(),
      File_Uplode.findOne({ file_id }).then((file) =>
        Loan.findOne({ loan_id: file.loan_id }).lean()
      ),
    ]);

    if (!file || !loan) {
      return res.status(404).json({
        statusCode: 404,
        message: "File or Loan not found",
      });
    }

    const steps = await Promise.all(
      loan.loan_step_id.map(async (loan_step_id) => {
        const stepData = await Loan_Step.findOne({ loan_step_id }).lean();
        if (!stepData) return null;

        if (loan_step_id === "1715348523661") {
          try {
            const response = await axios.get(
              `https://admin.savajcapital.com/api/file_upload/get_documents/${file_id}`
            );

            const documentStatus = response.data.data.status;
            return { loan_step: stepData.loan_step, status: documentStatus };
          } catch (error) {
            console.error("Error fetching documents: ", error.message);
            return { loan_step: stepData.loan_step, status: "error" };
          }
        } else {
          const completedStep = await Compelete_Step.findOne({
            loan_step_id,
            file_id,
            user_id: file.user_id,
          }).lean();

          let status = "active";
          if (completedStep) {
            status = completedStep.status;
          }

          return { loan_step: stepData.loan_step, status };
        }
      })
    );

    const filteredSteps = steps.filter((step) => step !== null);

    res.json({
      statusCode: 200,
      data: filteredSteps,
      message: "Read All Request",
    });
  } catch (error) {
    console.error("Error in /get_all_steps: ", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
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
        status:
          pendingObject.length > 0
            ? "active"
            : approvedObject.length === 0
            ? "active"
            : "complete",
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

router.get("/savajusers/:state/:city/:branchuser_id?", async (req, res) => {
  try {
    const { state, city, branchuser_id } = req.params;
    const currentPage = parseInt(req.query.page) || 1;
    const dataPerPage = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm?.toLowerCase() || "";
    const selectedLoan = req.query.selectedLoan || "";
    const selectedLoanSubType = req.query.selectedSubtype || "";
    const selectedStatus = req.query.selectedStatus?.toLowerCase() || "";
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

    if (selectedLoan && selectedLoan !== "all loan types") {
      matchStage.loan_id = selectedLoan;
    }
    if (selectedLoanSubType) {
      matchStage.loantype_id = selectedLoanSubType;
    }
    if (selectedStatus) {
      matchStage.status = { $regex: selectedStatus, $options: "i" };
    }

    const matchStageStateCity = { state, city };

    const users = await AddUser.find(matchStageStateCity);

    const userIds = users.map((user) => user.user_id);

    const fileMatchStage = { user_id: { $in: userIds } };

    let totalDataCount = 0;

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
      {
        $lookup: {
          from: "allusers",
          localField: "user_id",
          foreignField: "user_id",
          as: "user_data",
        },
      },
      {
        $lookup: {
          from: "loans",
          localField: "loan_id",
          foreignField: "loan_id",
          as: "loan_data",
        },
      },
      {
        $lookup: {
          from: "loan-types",
          localField: "loantype_id",
          foreignField: "loantype_id",
          as: "loan_type_data",
        },
      },
      {
        $lookup: {
          from: "complete_steps",
          localField: "file_id",
          foreignField: "file_id",
          as: "complete_steps",
        },
      },
      {
        $lookup: {
          from: "loanstatuses",
          localField: "status",
          foreignField: "loanstatus_id",
          as: "loan_status_data",
        },
      },
      {
        $lookup: {
          from: "loan_steps",
          localField: "loan_step_id",
          foreignField: "loan_step_id",
          as: "loan_steps_data",
        },
      },
      {
        $lookup: {
          from: "loan-documents",
          let: { loan_id: "$loan_id", loantype_id: "$loantype_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$loan_id", "$$loan_id"] },
                    { $eq: ["$loantype_id", "$$loantype_id"] },
                  ],
                },
              },
            },
            { $unwind: "$document_ids" },
          ],
          as: "loan_documents_data",
        },
      },
    ];

    if (branchuser_id) {
      const approvalFiles = await BranchAssign.find({
        branchuser_id: branchuser_id,
      }).select("file_id");
      const approvalFileIds = approvalFiles.map((file) => file.file_id);

      pipeline.splice(1, 0, { $match: { file_id: { $in: approvalFileIds } } });

      // Count the documents based on the filtered files
      totalDataCount = await File_Uplode.countDocuments({
        file_id: { $in: approvalFileIds },
        ...matchStage,
        ...fileMatchStage,
      });
    } else {
      const stateCityMatch = { state, city };
      totalDataCount = await File_Uplode.countDocuments({
        ...stateCityMatch,
        ...matchStage,
        ...fileMatchStage,
      });
    }

    const data = await File_Uplode.aggregate(pipeline);

    const userMap = new Map(
      data.flatMap((item) => item.user_data.map((user) => [user.user_id, user]))
    );
    const loanMap = new Map(
      data.flatMap((item) => item.loan_data.map((loan) => [loan.loan_id, loan]))
    );
    const loanTypeMap = new Map(
      data.flatMap((item) =>
        item.loan_type_data.map((loanType) => [loanType.loantype_id, loanType])
      )
    );
    const statusMessageMap = new Map();
    const amountMap = new Map();
    const loanStatusMap = new Map(
      data.flatMap((item) =>
        item.loan_status_data.map((status) => [
          status.loanstatus_id.toString(),
          status,
        ])
      )
    );

    data.forEach((item) => {
      item.complete_steps.forEach((step) => {
        if (step.statusMessage) {
          statusMessageMap.set(step.file_id, step.statusMessage);
        }
        if (step.loan_step_id === "1715348798228") {
          const dispatchAmountInput = step.inputs.find(
            (input) => input.label === "DISPATCH AMOUNT"
          );
          if (dispatchAmountInput) {
            amountMap.set(step.file_id, dispatchAmountInput.value);
          }
        }
      });
    });

    const loanSteps = await Loan_Step.find({}).lean();
    const loanStepsMap = new Map(
      loanSteps.map((step) => [step.loan_step_id, step])
    );

    const loanDocuments = await Loan_Documents.find({}).lean();
    const loanDocumentsMap = new Map(
      loanDocuments.map((doc) => [doc.loan_document_id, doc])
    );

    const stepsPromises = data.map(async (item) => {
      const file = item;
      const loan = loanMap.get(file.loan_id);

      if (!file || !loan) return;

      const steps = loan.loan_step_id.map((loan_step_id) => {
        const stepData = loanStepsMap.get(loan_step_id);
        if (!stepData) return null;

        if (loan_step_id === "1715348523661") {
          const loanIds = file.documents.map((item) => ({
            loan_document_id: item.loan_document_id,
            title_id: item.title_id,
          }));

          const { loan_id, loantype_id } = file;
          const data2 = loanDocuments.filter(
            (doc) => doc.loan_id === loan_id && doc.loantype_id === loantype_id
          );

          const loanDocumentIds = data2.flatMap((item) =>
            item.document_ids.map((loan_document_id) => ({
              loan_document_id,
              title_id: item.title_id,
            }))
          );

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
            const document = loanDocumentsMap.get(item.loan_document_id);
            approvedObject.push({
              name: document?.loan_document,
            });
          }

          for (const item of differentIds) {
            const document = loanDocumentsMap.get(item.loan_document_id);
            pendingObject.push({
              name: document?.loan_document,
            });
          }

          const documentStatus =
            pendingObject.length > 0
              ? "active"
              : approvedObject.length === 0
              ? "active"
              : "complete";

          return { loan_step: stepData?.loan_step, status: documentStatus };
        } else {
          const completedStep = file.complete_steps.find(
            (step) => step.loan_step_id === loan_step_id
          );

          let status = "active";
          if (completedStep) {
            status = completedStep.status;
          }

          return { loan_step: stepData?.loan_step, status };
        }
      });

      const filteredSteps = steps.filter((step) => step !== null);

      const rejectedStep = filteredSteps.find(
        (step) => step.status === "reject"
      );
      const activeStep = filteredSteps.find((step) => step.status === "active");

      if (rejectedStep) {
        item.running_step_name = rejectedStep?.loan_step;
      } else if (activeStep) {
        item.running_step_name = activeStep?.loan_step;
      } else {
        const lastIndex = filteredSteps.length - 1;
        item.running_step_name = filteredSteps[lastIndex]?.loan_step;
      }
    });

    await Promise.all(stepsPromises);

    for (const item of data) {
      item.user_username = userMap.get(item.user_id)?.username || "";
      item.pan_card = userMap.get(item.user_id)?.pan_card || "";
      item.businessname = userMap.get(item.user_id)?.businessname || "";
      item.state = userMap.get(item.user_id)?.state || "";
      item.city = userMap.get(item.user_id)?.city || "";
      item.loan = loanMap.get(item.loan_id)?.loan || "";
      item.loan_type = loanTypeMap.get(item.loantype_id)?.loan_type || "";
      item.status_message = statusMessageMap.get(item.file_id) || "";
      item.amount = amountMap.get(item.file_id) || "";

      if (loanStatusMap.has(item.status)) {
        const loanStatus = loanStatusMap.get(item.status);
        item.status = loanStatus.loanstatus;
        item.color = loanStatus.color;
      }

      const approvedCount = item.documents.filter((doc) =>
        item.loan_documents_data.some(
          (c) => c.document_ids === doc.loan_document_id
        )
      ).length;

      const totalCount = item.loan_documents_data.length;
      const documentPercentage = parseInt((approvedCount * 100) / totalCount);

      item.document_percentage = documentPercentage;
    }

    const responseData = data.map((item) => ({
      document_percentage: item.document_percentage,
      color: item.color,
      amount: item.amount,
      status_message: item.status_message,
      loan_type: item.loan_type,
      loan: item.loan,
      user_username: item.user_username,
      businessname: item.businessname,
      running_step_name: item.running_step_name,
      status: item.status,
      file_id: item.file_id,
      city: item.city,
      user_id: item.user_id,
      loan_id: item.loan_id,
      loantype_id: item.loantype_id,
    }));

    res.json({
      statusCode: 200,
      data: responseData,
      totalPages: Math.ceil(totalDataCount / dataPerPage),
      currentPage,
      totalCount: totalDataCount,
      message: "Read All Request",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/bankusers/:state/:city/:bankuser_id?", async (req, res) => {
  try {
    const { state, city, bankuser_id } = req.params;
    const currentPage = parseInt(req.query.page) || 1;
    const dataPerPage = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm?.toLowerCase() || "";
    const selectedLoan = req.query.selectedLoan || "";
    const selectedLoanSubType = req.query.selectedSubtype || "";
    const selectedStatus = req.query.selectedStatus?.toLowerCase() || "";
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

    if (selectedLoan && selectedLoan !== "all loan types") {
      matchStage.loan_id = selectedLoan;
    }
    if (selectedLoanSubType) {
      matchStage.loantype_id = selectedLoanSubType;
    }
    if (selectedStatus) {
      matchStage.status = { $regex: selectedStatus, $options: "i" };
    }

    const matchStageStateCity = { state, city };

    const users = await AddUser.find(matchStageStateCity);

    const userIds = users.map((user) => user.user_id);

    const fileMatchStage = { user_id: { $in: userIds } };

    let totalDataCount = 0;

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
      {
        $lookup: {
          from: "allusers",
          localField: "user_id",
          foreignField: "user_id",
          as: "user_data",
        },
      },
      {
        $lookup: {
          from: "loans",
          localField: "loan_id",
          foreignField: "loan_id",
          as: "loan_data",
        },
      },
      {
        $lookup: {
          from: "loan-types",
          localField: "loantype_id",
          foreignField: "loantype_id",
          as: "loan_type_data",
        },
      },
      {
        $lookup: {
          from: "complete_steps",
          localField: "file_id",
          foreignField: "file_id",
          as: "complete_steps",
        },
      },
      {
        $lookup: {
          from: "loanstatuses",
          localField: "status",
          foreignField: "loanstatus_id",
          as: "loan_status_data",
        },
      },
      {
        $lookup: {
          from: "loan_steps",
          localField: "loan_step_id",
          foreignField: "loan_step_id",
          as: "loan_steps_data",
        },
      },
      {
        $lookup: {
          from: "loan-documents",
          let: { loan_id: "$loan_id", loantype_id: "$loantype_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$loan_id", "$$loan_id"] },
                    { $eq: ["$loantype_id", "$$loantype_id"] },
                  ],
                },
              },
            },
            { $unwind: "$document_ids" },
          ],
          as: "loan_documents_data",
        },
      },
    ];

    if (bankuser_id) {
      const approvalFiles = await BankApproval.find({
        bankuser_id: bankuser_id,
      }).select("file_id");
      const approvalFileIds = approvalFiles.map((file) => file.file_id);

      pipeline.splice(1, 0, { $match: { file_id: { $in: approvalFileIds } } });

      // Count the documents based on the filtered files
      totalDataCount = await File_Uplode.countDocuments({
        file_id: { $in: approvalFileIds },
        ...matchStage,
        ...fileMatchStage,
      });
    } else {
      const stateCityMatch = { state, city };
      totalDataCount = await File_Uplode.countDocuments({
        ...stateCityMatch,
        ...matchStage,
        ...fileMatchStage,
      });
    }

    const data = await File_Uplode.aggregate(pipeline);

    const userMap = new Map(
      data.flatMap((item) => item.user_data.map((user) => [user.user_id, user]))
    );
    const loanMap = new Map(
      data.flatMap((item) => item.loan_data.map((loan) => [loan.loan_id, loan]))
    );
    const loanTypeMap = new Map(
      data.flatMap((item) =>
        item.loan_type_data.map((loanType) => [loanType.loantype_id, loanType])
      )
    );
    const statusMessageMap = new Map();
    const amountMap = new Map();
    const loanStatusMap = new Map(
      data.flatMap((item) =>
        item.loan_status_data.map((status) => [
          status.loanstatus_id.toString(),
          status,
        ])
      )
    );

    data.forEach((item) => {
      item.complete_steps.forEach((step) => {
        if (step.statusMessage) {
          statusMessageMap.set(step.file_id, step.statusMessage);
        }
        if (step.loan_step_id === "1715348798228") {
          const dispatchAmountInput = step.inputs.find(
            (input) => input.label === "DISPATCH AMOUNT"
          );
          if (dispatchAmountInput) {
            amountMap.set(step.file_id, dispatchAmountInput.value);
          }
        }
      });
    });

    const loanSteps = await Loan_Step.find({}).lean();
    const loanStepsMap = new Map(
      loanSteps.map((step) => [step.loan_step_id, step])
    );

    const loanDocuments = await Loan_Documents.find({}).lean();
    const loanDocumentsMap = new Map(
      loanDocuments.map((doc) => [doc.loan_document_id, doc])
    );

    const stepsPromises = data.map(async (item) => {
      const file = item;
      const loan = loanMap.get(file.loan_id);

      if (!file || !loan) return;

      const steps = loan.loan_step_id.map((loan_step_id) => {
        const stepData = loanStepsMap.get(loan_step_id);
        if (!stepData) return null;

        if (loan_step_id === "1715348523661") {
          const loanIds = file.documents.map((item) => ({
            loan_document_id: item.loan_document_id,
            title_id: item.title_id,
          }));

          const { loan_id, loantype_id } = file;
          const data2 = loanDocuments.filter(
            (doc) => doc.loan_id === loan_id && doc.loantype_id === loantype_id
          );

          const loanDocumentIds = data2.flatMap((item) =>
            item.document_ids.map((loan_document_id) => ({
              loan_document_id,
              title_id: item.title_id,
            }))
          );

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
            const document = loanDocumentsMap.get(item.loan_document_id);
            approvedObject.push({
              name: document?.loan_document,
            });
          }

          for (const item of differentIds) {
            const document = loanDocumentsMap.get(item.loan_document_id);
            pendingObject.push({
              name: document?.loan_document,
            });
          }

          const documentStatus =
            pendingObject.length > 0
              ? "active"
              : approvedObject.length === 0
              ? "active"
              : "complete";

          return { loan_step: stepData?.loan_step, status: documentStatus };
        } else {
          const completedStep = file.complete_steps.find(
            (step) => step.loan_step_id === loan_step_id
          );

          let status = "active";
          if (completedStep) {
            status = completedStep.status;
          }

          return { loan_step: stepData?.loan_step, status };
        }
      });

      const filteredSteps = steps.filter((step) => step !== null);

      const rejectedStep = filteredSteps.find(
        (step) => step.status === "reject"
      );
      const activeStep = filteredSteps.find((step) => step.status === "active");

      if (rejectedStep) {
        item.running_step_name = rejectedStep?.loan_step;
      } else if (activeStep) {
        item.running_step_name = activeStep?.loan_step;
      } else {
        const lastIndex = filteredSteps.length - 1;
        item.running_step_name = filteredSteps[lastIndex]?.loan_step;
      }
    });

    await Promise.all(stepsPromises);

    for (const item of data) {
      item.user_username = userMap.get(item.user_id)?.username || "";
      item.pan_card = userMap.get(item.user_id)?.pan_card || "";
      item.businessname = userMap.get(item.user_id)?.businessname || "";
      item.state = userMap.get(item.user_id)?.state || "";
      item.city = userMap.get(item.user_id)?.city || "";
      item.loan = loanMap.get(item.loan_id)?.loan || "";
      item.loan_type = loanTypeMap.get(item.loantype_id)?.loan_type || "";
      item.status_message = statusMessageMap.get(item.file_id) || "";
      item.amount = amountMap.get(item.file_id) || "";

      if (loanStatusMap.has(item.status)) {
        const loanStatus = loanStatusMap.get(item.status);
        item.status = loanStatus.loanstatus;
        item.color = loanStatus.color;
      }

      const approvedCount = item.documents.filter((doc) =>
        item.loan_documents_data.some(
          (c) => c.document_ids === doc.loan_document_id
        )
      ).length;

      const totalCount = item.loan_documents_data.length;
      const documentPercentage = parseInt((approvedCount * 100) / totalCount);

      item.document_percentage = documentPercentage;
    }

    const responseData = data.map((item) => ({
      document_percentage: item.document_percentage,
      color: item.color,
      amount: item.amount,
      status_message: item.status_message,
      loan_type: item.loan_type,
      loan: item.loan,
      user_username: item.user_username,
      businessname: item.businessname,
      running_step_name: item.running_step_name,
      status: item.status,
      file_id: item.file_id,
      city: item.city,
      user_id: item.user_id,
      loan_id: item.loan_id,
      loantype_id: item.loantype_id,
    }));

    res.json({
      statusCode: 200,
      data: responseData,
      totalPages: Math.ceil(totalDataCount / dataPerPage),
      currentPage,
      totalCount: totalDataCount,
      message: "Read All Request",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/file_upload/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const fileData = await File_Uplode.findOne({ file_id: file_id });

    if (!fileData) {
      return res.status(404).json({ message: "File not found" });
    }

    const loan = await Loan.findOne({ loan_id: fileData.loan_id });
    const user = await AddUser.findOne({ user_id: fileData.user_id });
    const loanType = await Loan_Type.findOne({
      loantype_id: fileData?.loantype_id,
    });

    if (user && user.password) {
      user.password = decrypt(user.password);
    }

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

    const bankApproval = await BankApproval.findOne({ file_id: file_id });

    let bankName = null;
    let bankBranchName = null;
    let bankUser = null;

    if (bankApproval) {
      const bank = await Bank.findOne({ bank_id: bankApproval.bank_id });
      bankName = bank ? bank.bank_name : null;
      bankBranchName = bank ? bank.branch_name : null;
      bankUser = await BankUser.findOne({
        bankuser_id: bankApproval.bankuser_id,
      });
    }

    const loanStatus = await LoanStatus.findOne({
      loanstatus_id: fileData.status,
    });

    const responseData = {
      file: {
        _id: fileData._id,
        branch_id: fileData.branch_id,
        branchuser_id: fileData.branchuser_id,
        user_id: fileData.user_id,
        loan_id: fileData.loan_id,
        loantype_id: fileData?.loantype_id,
        status: fileData?.status,
        file_id: fileData.file_id,
        loan: loan.loan,
        loan_type: loanType?.loan_type,
        user: user,
        documents: formattedData,
        logs: fileData.logs,
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
        __v: fileData.__v,
      },
      bankApproval: bankApproval
        ? {
            bank_name: bankName,
            bankbranch_name: bankBranchName,
            bank_user: bankUser,
          }
        : null,
      loanStatus: loanStatus
        ? {
            loanstatus_id: loanStatus.loanstatus_id,
            loanstatus: loanStatus.loanstatus,
            color: loanStatus.color,
          }
        : null,
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

router.put("/logs/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const updateData = req.body;

    if (updateData.logs && updateData.logs.length > 0) {
      updateData.logs.forEach((log, index) => {
        log.log_id = `${moment().unix()}_${Math.floor(
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

router.delete("/logs/:file_id/:log_id", async (req, res) => {
  try {
    const { file_id, log_id } = req.params;

    const updatedFile = await File_Uplode.findOneAndUpdate(
      { file_id },
      { $pull: { logs: { log_id } } },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.json({
      success: true,
      message: "Log deleted successfully",
      updatedFile,
    });
  } catch (error) {
    console.error(`Error deleting log: ${error}`);
    res.status(500).json({
      success: false,
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

    const data = await File_Uplode.findOne({ file_id }).lean();
    if (!data) {
      return res.status(404).json({
        statusCode: 404,
        message: "File not found",
      });
    }

    const loanIds = data.documents.map((item) => ({
      loan_document_id: item.loan_document_id,
      title_id: item.title_id,
    }));

    const { loan_id, loantype_id } = data;

    const [loanDocuments, addDocuments, titles] = await Promise.all([
      Loan_Documents.find({ loan_id, loantype_id }).lean(),
      AddDocuments.find({}).lean(),
      Title.find({}).lean(),
    ]);

    const loanDocumentIds = loanDocuments.flatMap((item) =>
      item.document_ids.map((loan_document_id) => ({
        loan_document_id,
        title_id: item.title_id,
      }))
    );

    const documentMap = new Map(
      addDocuments.map((doc) => [doc.document_id, doc])
    );
    const titleMap = new Map(titles.map((title) => [title.title_id, title]));

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

    const approvedObject = commonIds.map((item) => ({
      name: documentMap.get(item.loan_document_id)?.document,
      status: "Uploaded",
      title: titleMap.get(item.title_id)?.title,
    }));

    const pendingObject = differentIds.map((item) => ({
      name: documentMap.get(item.loan_document_id)?.document,
      status: "Pending",
      title: titleMap.get(item.title_id)?.title,
    }));

    const diff = (approvedObject.length * 100) / loanDocumentIds.length;

    res.json({
      statusCode: 200,
      data: {
        approvedData: approvedObject,
        pendingData: pendingObject,
        file_id: file_id,
        document_percentage: Math.round(diff),
      },
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/get_all_documents/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const data = await File_Uplode.findOne({ file_id });
    const loanIds = data.documents.map((item) => ({
      loan_document_id: item.loan_document_id,
      title_id: item.title_id,
    }));

    const { loan_id, loantype_id } = data;
    const data2 = await Loan_Documents.find({ loan_id, loantype_id });
    const loanDocumentIds = data2.flatMap((item) =>
      item.document_ids.map((loan_document_id) => ({
        loan_document_id,
        title_id: item.title_id,
      }))
    );

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

    const pendingObject = [];

    for (const item of differentIds) {
      const document = await AddDocuments.findOne({
        document_id: item.loan_document_id,
      });
      pendingObject.push({
        name: document.document,
      });
    }

    const status =
      pendingObject.length > 0
        ? "active"
        : commonIds.length === loanIds.length
        ? "complete"
        : "active";

    res.json({
      statusCode: 200,
      status,
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/amounts/:loan_id?/:loantype_id?", async (req, res) => {
  try {
    const { loan_id, loantype_id } = req.params;
    const { state, city, selectedStatusSearch } = req.query;

    const query = {};
    if (loan_id) {
      query.loan_id = loan_id;
    }
    if (loantype_id) {
      query.loantype_id = loantype_id;
    }
    if (selectedStatusSearch) {
      query.status = selectedStatusSearch;
    }

    const allFiles = await File_Uplode.find(query);

    const userIds = allFiles.map((file) => file.user_id);
    const users = await AddUser.find({ user_id: { $in: userIds } });
    const userStatesCities = users.map((user) => ({
      user_id: user.user_id,
      state: user.state,
      city: user.city,
    }));

    const completedSteps = await Compelete_Step.find({
      file_id: { $in: allFiles.map((file) => file.file_id) },
      loan_step_id: "1715348798228",
    });

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

    const filteredAmounts = amounts.filter((amount) => {
      return (
        (!state || amount.state === state) && (!city || amount.city === city)
      );
    });

    const totalAmount = filteredAmounts.reduce(
      (total, item) => total + item.amount,
      0
    );

    const loanStatuses = await LoanStatus.find().lean();
    const statusMap = {};
    loanStatuses.forEach((status) => {
      statusMap[status.loanstatus_id] = status;
    });

    const statusCounts = loanStatuses.reduce((acc, status) => {
      acc[status.loanstatus] = { count: 0, color: status.color };
      return acc;
    }, {});

    allFiles.forEach((file) => {
      const status = statusMap[file.status];
      if (status) {
        statusCounts[status.loanstatus].count++;
      }
    });

    const filteredStatusCounts = Object.entries(statusCounts).reduce(
      (acc, [key, value]) => {
        if (value.count > 0) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    res.json({
      statusCode: 200,
      totalAmount,
      fileCount: allFiles.length,
      loantype_id,
      statusCounts: filteredStatusCounts,
      message:
        "Total amount and file count for approved files fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get(
  "/branchamounts/:branchuser_id/:loan_id?/:loantype_id?",
  async (req, res) => {
    try {
      const { loan_id, loantype_id, branchuser_id } = req.params;
      const { state, city, selectedStatusSearch } = req.query;

      const query = {};
      if (loan_id) {
        query.loan_id = loan_id;
      }
      if (loantype_id) {
        query.loantype_id = loantype_id;
      }
      if (selectedStatusSearch) {
        query.status = selectedStatusSearch;
      }
      if (branchuser_id) {
        const branchApprovals = await SavajCapital_BranchAssign.find({
          branchuser_id,
        });

        const fileIds = branchApprovals.map((approval) => approval.file_id);

        if (fileIds.length === 0) {
          return res.json({
            statusCode: 200,
            totalAmount: 0,
            fileCount: 0,
            loantype_id,
            statusCounts: {},
            message: "No files found for the given branchuser_id",
          });
        }

        query.file_id = { $in: fileIds };
      }

      const allFiles = await File_Uplode.find(query);

      const userIds = allFiles.map((file) => file.user_id);
      const users = await AddUser.find({ user_id: { $in: userIds } });
      const userStatesCities = users.map((user) => ({
        user_id: user.user_id,
        state: user.state,
        city: user.city,
      }));

      const completedSteps = await Compelete_Step.find({
        file_id: { $in: allFiles.map((file) => file.file_id) },
        loan_step_id: "1715348798228",
      });

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

      const filteredAmounts = amounts.filter((amount) => {
        return (
          (!state || amount.state === state) && (!city || amount.city === city)
        );
      });

      const totalAmount = filteredAmounts.reduce(
        (total, item) => total + item.amount,
        0
      );

      const loanStatuses = await LoanStatus.find().lean();
      const statusMap = {};
      loanStatuses.forEach((status) => {
        statusMap[status.loanstatus_id] = status;
      });

      const statusCounts = loanStatuses.reduce((acc, status) => {
        acc[status.loanstatus] = { count: 0, color: status.color };
        return acc;
      }, {});

      allFiles.forEach((file) => {
        const status = statusMap[file.status];
        if (status) {
          statusCounts[status.loanstatus].count++;
        }
      });

      const filteredStatusCounts = Object.entries(statusCounts).reduce(
        (acc, [key, value]) => {
          if (value.count > 0) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      res.json({
        statusCode: 200,
        totalAmount,
        fileCount: allFiles.length,
        loantype_id,
        statusCounts: filteredStatusCounts,
        message:
          "Total amount and file count for approved files fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }
);

router.get(
  "/bankamounts/:bankuser_id/:loan_id?/:loantype_id?",
  async (req, res) => {
    try {
      const { loan_id, loantype_id, bankuser_id } = req.params;
      const { state, city, selectedStatusSearch } = req.query;

      const fileQuery = {};
      if (loan_id) {
        fileQuery.loan_id = loan_id;
      }
      if (loantype_id) {
        fileQuery.loantype_id = loantype_id;
      }
      if (selectedStatusSearch) {
        fileQuery.status = selectedStatusSearch;
      }

      if (bankuser_id) {
        const bankApprovals = await BankApproval.find({ bankuser_id });

        const fileIds = bankApprovals.map((approval) => approval.file_id);

        if (fileIds.length === 0) {
          return res.json({
            statusCode: 200,
            totalAmount: 0,
            fileCount: 0,
            loantype_id,
            statusCounts: {},
            message: "No files found for the given bankuser_id",
          });
        }

        fileQuery.file_id = { $in: fileIds };
      }

      const allFiles = await File_Uplode.find(fileQuery);

      if (allFiles.length === 0) {
        return res.json({
          statusCode: 200,
          totalAmount: 0,
          fileCount: 0,
          statusCounts: {},
          message: "No files found matching the query",
        });
      }

      const userIds = allFiles.map((file) => file.user_id);
      const users = await AddUser.find({ user_id: { $in: userIds } });
      const userStatesCities = users.map((user) => ({
        user_id: user.user_id,
        state: user.state,
        city: user.city,
      }));

      const completedSteps = await Compelete_Step.find({
        file_id: { $in: allFiles.map((file) => file.file_id) },
        loan_step_id: "1715348798228",
      });

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

      const filteredAmounts = amounts.filter((amount) => {
        return (
          (!state || amount.state === state) && (!city || amount.city === city)
        );
      });

      const totalAmount = filteredAmounts.reduce(
        (total, item) => total + item.amount,
        0
      );

      const loanStatuses = await LoanStatus.find().lean();
      const statusMap = {};
      loanStatuses.forEach((status) => {
        statusMap[status.loanstatus_id] = status;
      });

      const statusCounts = loanStatuses.reduce((acc, status) => {
        acc[status.loanstatus] = { count: 0, color: status.color };
        return acc;
      }, {});

      allFiles.forEach((file) => {
        const status = statusMap[file.status];
        if (status) {
          statusCounts[status.loanstatus].count++;
        }
      });

      const filteredStatusCounts = Object.entries(statusCounts).reduce(
        (acc, [key, value]) => {
          if (value.count > 0) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      res.json({
        statusCode: 200,
        totalAmount,
        fileCount: allFiles.length,
        loantype_id,
        statusCounts: filteredStatusCounts,
        message:
          "Total amount and file count for approved files fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }
);

router.get(
  "/scbranchamounts/:loan_id/:loantype_id/:state/:city",
  async (req, res) => {
    try {
      let { loan_id, loantype_id, state, city } = req.params;

      if (loantype_id === "none") {
        loantype_id = undefined;
      }

      const query = { loan_id, status: "1718861579508" };
      if (loantype_id) {
        query.loantype_id = loantype_id;
      }

      const approvedFiles = await File_Uplode.find(query);
      const fileIds = approvedFiles.map((file) => file.file_id);
      const userIds = approvedFiles.map((file) => file.user_id);

      const users = await AddUser.find({ user_id: { $in: userIds } });
      const userStatesCities = users.map((user) => ({
        user_id: user.user_id,
        state: user.state,
        city: user.city,
      }));

      const completedSteps = await Compelete_Step.find({
        file_id: { $in: fileIds },
        loan_step_id: "1715348798228",
      });

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

      const filteredAmounts = amounts.filter((amount) => {
        return (
          (!state || amount.state === state) && (!city || amount.city === city)
        );
      });

      const totalAmount = filteredAmounts.reduce(
        (total, item) => total + item.amount,
        0
      );

      res.json({
        statusCode: 200,
        totalAmount,
        loantype_id: loantype_id || "None",
        message: "Total amount for approved files fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }
);

router.put("/updatestatus/:fileId", async (req, res) => {
  try {
    const { status } = req.body;
    const { fileId } = req.params;

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
      console.error("File not found for fileId:", fileId);
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    const user = await AddUser.findOne({ user_id: updatedFile.user_id });
    if (!user) {
      console.error("User not found for user_id:", updatedFile.user_id);
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const loan = await Loan.findOne({ loan_id: updatedFile.loan_id });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found.",
      });
    }

    const loanStatus = await LoanStatus.findOne({ loanstatus_id: status });
    if (!loanStatus) {
      console.error("Loan status not found for loanstatus_id:", status);
      return res.status(404).json({
        success: false,
        message: "Loan status not found.",
      });
    }

    const logEntry = {
      log_id: `${moment().unix()}_${Math.floor(Math.random() * 1000)}`,
      message: `Status updated to ${loanStatus.loanstatus}`,
      timestamp: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    };

    await File_Uplode.findOneAndUpdate(
      { file_id: fileId },
      {
        $push: { logs: logEntry },
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      }
    );
    const emailSubject = "File Status Updated";
    const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background: #f5f5f5; padding: 20px; text-align: center;">
        <img src="https://cdn.dohost.in/upload/629imgpsh_fullsize_anim.jpg" alt="Company Logo" style="width: 100px; height: auto;"/>
      </div>
      <div style="padding: 20px;">
        <h1 style="color: #b19552;">File Status Updated</h1>
        <p>Hello ${user.username},</p>
        <p>We wanted to inform you that the status of your file has been updated. Here are the details:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Loan:</strong> ${loan.loan}</li>
          <li><strong>New Status:</strong> ${loanStatus.loanstatus}</li>
          <li><strong>Updated On:</strong> ${moment(
            updatedFile.updatedAt
          ).format("YYYY-MM-DD HH:mm:ss")}</li>
        </ul>
        <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
        <p>Thank you,<br>Savaj Capital</p>
      </div>
      <div style="background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #888;">
        <p>© ${new Date().getFullYear()} Savaj Capital. All rights reserved.</p>
      </div>
    </div>
  `;

    await emailService.sendWelcomeEmail(user.email, emailSubject, emailContent);

    res.json({
      success: true,
      data: updatedFile,
      message: "File status updated successfully and email sent.",
    });
  } catch (error) {
    console.error("Error updating file status:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
