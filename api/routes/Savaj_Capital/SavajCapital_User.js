const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddUser = require("../../models/AddUser");
const BankUser = require("../../models/Bank/BankUserSchema");
const SuperAdmin = require("../../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const SavajCapital_Role = require("../../models/Savaj_Capital/SavajCapital_Role");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const crypto = require("crypto");
const axios = require("axios");
const Branch_Assign = require("../../models/Savaj_Capital/Branch_Assign");
const File_Uplode = require("../../models/File/File_Uplode");
const LoanStatus = require("../../models/AddDocuments/LoanStatus");
const Compelete_Step = require("../../models/Loan_Step/Compelete_Step");
const Loan_Documents = require("../../models/Loan/Loan_Documents");
const Loan_Step = require("../../models/Loan_Step/Loan_Step");

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "vaibhav");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// const decrypt = (text) => {
//   const decipher = crypto.createDecipher("aes-256-cbc", "vaibhav");
//   let decrypted = decipher.update(text, "hex", "utf-8");
//   decrypted += decipher.final("utf-8");
//   return decrypted;
// };

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
    let findEmail = await SavajCapital_User.findOne({
      email: req.body.email,
    });

    let findMobileNumber = await SavajCapital_User.findOne({
      number: req.body.number,
    });

    const numberExistsInBankUser = await BankUser.findOne({
      mobile: req.body.number,
    });

    const userNumberExists = await AddUser.findOne({
      number: req.body.number,
    });

    const user = await AddUser.findOne({ email: req.body.email });
    const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (findEmail || bankUser || superAdmin || user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    if (findMobileNumber || numberExistsInBankUser || userNumberExists) {
      return res
        .status(200)
        .send({ statusCode: 202, message: "Mobile number already in use" });
    }

    // if (!findEmail || !user || !bankUser || !superAdmin) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    const hashedPassword = encrypt(req.body.password);

    req.body["branchuser_id"] = uniqueId;
    req.body["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["password"] = hashedPassword;

    var data = await SavajCapital_User.create(req.body);

    const ApiResponse = await axios.post(
      `http://localhost:5882/api/setpassword/passwordmail`,
      {
        email: req.body.email,
      }
    );

    if (ApiResponse.status === 200) {
      res.json({
        success: true,
        data: data,
        message: "Add Branch-User Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/:branch_id", async (req, res) => {
  try {
    const branch_id = req.params.branch_id;

    const branch = await SavajCapital_Branch.findOne({ branch_id }).lean();
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const branchUsers = await SavajCapital_User.aggregate([
      { $match: { branch_id } },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: "savaj_capital-roles",
          localField: "role_id",
          foreignField: "role_id",
          as: "role_info",
        },
      },
      {
        $unwind: {
          path: "$role_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          role: "$role_info.role",
        },
      },
    ]);

    const branchUserIds = branchUsers.map((user) => user.branchuser_id);
    const branchAssigns = await Branch_Assign.find({ branchuser_id: { $in: branchUserIds } }).lean();
    const fileIds = branchAssigns.map((assign) => assign.file_id);
    const files = await File_Uplode.find({ file_id: { $in: fileIds } }).lean();

    const loanStatusIds = files.map((file) => file.status);
    const loanStatuses = await LoanStatus.find({ loanstatus_id: { $in: loanStatusIds } }).lean();

    const userIds = files.map((file) => file.user_id);
    const users = await AddUser.find({ user_id: { $in: userIds } }).lean();

    const loanIds = files.map((file) => file.loan_id);
    const loans = await Loan.find({ loan_id: { $in: loanIds } }).lean();

    const loanStatusMap = new Map(loanStatuses.map((status) => [status.loanstatus_id, status]));
    const userMap = new Map(users.map((user) => [user.user_id, user]));
    const loanMap = new Map(loans.map((loan) => [loan.loan_id, loan]));

    const fileDetailsMap = new Map(
      files.map((file) => {
        const statusDetails = loanStatusMap.get(file.status);
        const userDetails = userMap.get(file.user_id);
        const loanDetails = loanMap.get(file.loan_id);

        return [
          file.file_id,
          {
            ...file,
            status: statusDetails ? statusDetails.loanstatus : file.status,
            status_color: statusDetails ? statusDetails.color : undefined,
            user_details: userDetails,
            loan_details: loanDetails,
          },
        ];
      })
    );

    const branchUserFiles = branchUsers.reduce((acc, user) => {
      const assignedFiles = branchAssigns
        .filter((assign) => assign.branchuser_id === user.branchuser_id)
        .map((assign) => ({
          ...assign,
          file_details: fileDetailsMap.get(assign.file_id),
        }));
      user.files = assignedFiles;
      user.assigned_file_count = assignedFiles.length;
      return acc.concat(user);
    }, []);

    branch.users = branchUserFiles;
    branch.user_count = branchUserFiles.length;
    branch.file_count = branchUserFiles.reduce((acc, user) => acc + user.assigned_file_count, 0);

    res.json({
      success: true,
      branch,
      data: branchUserFiles,
      count: branchUserFiles.length,
      totalCount: branch.file_count,
      message: "Read All Request",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// router.get("/:branch_id", async (req, res) => {
//   try {
//     const branch_id = req.params.branch_id;

//     var data = await SavajCapital_User.aggregate([
//       {
//         $match: { branch_id: branch_id },
//       },
//       {
//         $sort: { updatedAt: -1 },
//       },
//     ]);
//     const branch = await SavajCapital_Branch.findOne({ branch_id });

//     for (let i = 0; i < data.length; i++) {
//       const role_id = data[i].role_id;

//       const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });

//       if (branch_data) {
//         data[i].role = branch_data.role;
//       }
//     }

//     data = await Promise.all(
//       data.map(async (user) => {
//         const count = await Branch_Assign.countDocuments({
//           branchuser_id: user.branchuser_id,
//         });
//         return { ...user, assigned_file_count: count };
//       })
//     );

//     const totalCount = data.reduce(
//       (acc, user) => acc + (user.assigned_file_count || 0),
//       0
//     );
//     const count = data.length;

//     res.json({
//       statusCode: 200,
//       branch,
//       data: data,
//       count: count,
//       totalCount,

//       message: "Read All Request",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });
// router.get("branch_users/:branch_id", async (req, res) => {
//   try {
//     const branch_id = req.params.branch_id;

//     // Fetch branch users
//     var data = await SavajCapital_User.aggregate([
//       {
//         $match: { branch_id: branch_id },
//       },
//       {
//         $sort: { updatedAt: -1 },
//       },
//     ]);

//     // Fetch count of assigned files for each branch user
//     data = await Promise.all(
//       data.map(async (user) => {
//         const count = await Branch_Assign.countDocuments({
//           branchuser_id: user.branchuser_id,
//         });
//         return { ...user, assigned_file_count: count };
//       })
//     );

//     // Fetch branch details
//     const branch = await SavajCapital_Branch.findOne({ branch_id });

//     // Update roles
//     for (let i = 0; i < data.length; i++) {
//       const role_id = data[i].role_id;
//       const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });
//       if (branch_data) {
//         data[i].role = branch_data.role;
//       }
//     }

//     // Calculate total count
//     const totalCount = data.reduce(
//       (acc, user) => acc + (user.assigned_file_count || 0),
//       0
//     );

//     res.json({
//       statusCode: 200,
//       branch,
//       data,
//       totalCount,
//       message: "Read All Request",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });
router.put("/:branchuser_id", async (req, res) => {
  try {
    const { branchuser_id } = req.params;

    // Ensure that updatedAt field is set
    const hashedPassword = encrypt(req.body.password);
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    req.body.password = hashedPassword;

    // if (!req.body.password) {
    //   delete req.body.password;
    // }
    const result = await SavajCapital_User.findOneAndUpdate(
      { branchuser_id: branchuser_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Branch-User Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Branch-User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/:branchuser_id", async (req, res) => {
  try {
    const { branchuser_id } = req.params;

    const savajUserExistsInSavajBranchAssign = await Branch_Assign.findOne({
      branchuser_id: branchuser_id,
    });

    if (savajUserExistsInSavajBranchAssign) {
      return res.status(200).json({
        statusCode: 201,
        message:
          "Branch user cannot be deleted because it is currently assigned.",
      });
    }

    const deletedUser = await SavajCapital_User.findOneAndDelete({
      branchuser_id: branchuser_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 201,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedRoleId: branchuser_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/user/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;

    var data = await SavajCapital_User.aggregate([
      {
        $match: { branchuser_id: branchuser_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    // const hashedPassword = decrypt(data[0]?.password);

    for (let i = 0; i < data.length; i++) {
      const decryptedPassword = decrypt(data[i]?.password);
      data[i].password = decryptedPassword;
    }

    const branch = await SavajCapital_Branch.findOne({
      branchuser_id: data.branchuser_id,
    });

    for (let i = 0; i < data.length; i++) {
      const role_id = data[i].role_id;

      const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });

      if (branch_data) {
        data[i].role = branch_data.role;
      }
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

// router.get("/assigned_file/:branchuser_id", async (req, res) => {
//   try {
//     const branchuser_id = req.params.branchuser_id;

//     const data = await File_Uplode.aggregate([
//       {
//         $match: { branchuser_id: branchuser_id },
//       },
//       {
//         $sort: { updatedAt: -1 },
//       },
//     ]);

//     const savajUserData = await SavajCapital_User.findOne({branchuser_id: branchuser_id})

//     for (let i = 0; i < data.length; i++) {
//       const loan_id = data[i]?.loan_id;
//       const loantype_id = data[i]?.loantype_id;
//       const user_id = data[i]?.user_id;

//       const loanData = await Loan.findOne({
//         loan_id: loan_id,
//       });

//       const loanTypeData = await Loan_Type.findOne({
//         loantype_id: loantype_id,
//       });

//       const userData = await AddUser.findOne({ user_id: user_id });

//       if (loanData) {
//         data[i].loan = loanData.loan;
//       }

//       if (loanTypeData) {
//         data[i].loan_type = loanTypeData.loan_type;
//       }

//       if(userData){
//         data[i].username = userData.username
//       }
//     }

//     const count = data.length;

//     res.json({
//       // statusCode: 200,
//       success: true,
//       savajUserData,
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

router.get("/assignedbranch_file/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;
    const branchUsersData = await SavajCapital_User.findOne({
      branchuser_id: branchuser_id,
    });

    const currentPage = parseInt(req.query.page) || 1;
    const dataPerPage = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm?.toLowerCase() || "";
    const selectedLoan = req.query.selectedLoan || "";
    const selectedLoanSubType = req.query.selectedSubtype || "";
    const selectedStatus = req.query.selectedStatus?.toLowerCase() || "";
    const selectedState = req.query.selectedState || "";
    const selectedCity = req.query.selectedCity || "";

    // Fetch assigned file_ids for the bankuser_id
    const bankApprovals = await Branch_Assign.find({
      branchuser_id: branchuser_id,
    }).select("file_id");

    const assignedFileIds = bankApprovals.map((approval) => approval.file_id);

    if (assignedFileIds.length === 0) {
      return res.json({
        statusCode: 200,
        data: [],
        totalPages: 0,
        currentPage,
        totalCount: 0,
        message: "No assigned files found",
      });
    }

    const matchStage = { file_id: { $in: assignedFileIds } };

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

          return { loan_step: stepData.loan_step, status: documentStatus };
        } else {
          const completedStep = file.complete_steps.find(
            (step) => step.loan_step_id === loan_step_id
          );

          let status = "active";
          if (completedStep) {
            status = completedStep.status;
          }

          return { loan_step: stepData.loan_step, status };
        }
      });

      const filteredSteps = steps.filter((step) => step !== null);

      const rejectedStep = filteredSteps.find(
        (step) => step.status === "reject"
      );
      const activeStep = filteredSteps.find((step) => step.status === "active");

      if (rejectedStep) {
        item.running_step_name = rejectedStep.loan_step;
      } else if (activeStep) {
        item.running_step_name = activeStep.loan_step;
      } else {
        const lastIndex = filteredSteps.length - 1;
        item.running_step_name = filteredSteps[lastIndex].loan_step;
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
    }));

    res.json({
      statusCode: 200,
      data: responseData,
      bankUserData: branchUsersData,
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

router.get("/assigned_file/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;

    const branchAssign = await Branch_Assign.find({
      branchuser_id: branchuser_id,
    }).sort({ updatedAt: -1 });

    const branchUserData = await SavajCapital_User.findOne({
      branchuser_id: branchuser_id,
    });

    const fileIds = branchAssign.map((approval) => approval.file_id);

    const fileDetails = await File_Uplode.find({ file_id: { $in: fileIds } });

    const augmentedData = await Promise.all(
      branchAssign.map(async (approval) => {
        const fileData = fileDetails.find(
          (detail) => detail.file_id === approval.file_id
        );
        if (!fileData) return null;

        const loanData = await Loan.findOne({ loan_id: fileData.loan_id });
        const loanTypeData = await Loan_Type.findOne({
          loantype_id: fileData.loantype_id,
        });
        const userData = await AddUser.findOne({ user_id: fileData.user_id });

        const entry = {
          ...approval.toObject(),
          file_data: fileData,
          loan: loanData ? loanData.loan : null,
          loan_type: loanTypeData ? loanTypeData.loan_type : null,
          username: userData ? userData.username : null,
        };

        const hasMissingDetail =
          !fileData || !loanData || !loanTypeData || !userData;

        return entry;
      })
    );

    res.json({
      success: true,
      data: augmentedData,
      count: augmentedData.length,
      branchUserData: branchUserData,
      message: "Bank approvals data with all details retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/assigedfile_delete/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    const deletedUser = await Branch_Assign.findOneAndDelete({
      file_id: file_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 202,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "File successfully deleted.",
      deletedBankId: file_id,
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
