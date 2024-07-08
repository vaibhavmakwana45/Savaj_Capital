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
      `https://admin.savajcapital.com/api/setpassword/passwordmail`,
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

    var data = await SavajCapital_User.aggregate([
      {
        $match: { branch_id: branch_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    const branch = await SavajCapital_Branch.findOne({
      branch_id: branch_id,
    }).lean(); // Use lean() to get plain JavaScript objects

    if (!branch) {
      return res.status(404).json({ message: "Bank not found" });
    }

    const branchUserCount = await SavajCapital_User.countDocuments({
      branch_id,
    });
    branch.user_count = branchUserCount;

    const branchUsers = await SavajCapital_User.find({ branch_id }).lean();
    for (let i = 0; i < data.length; i++) {
      const role_id = data[i].role_id;

      const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });

      if (branch_data) {
        data[i].role = branch_data.role;
      }
    }

    for (let j = 0; j < branchUsers.length; j++) {
      const branchuser_id = branchUsers[j].branchuser_id;

      const assignedFiles = await Branch_Assign.find({ branchuser_id }).lean();

      for (let k = 0; k < assignedFiles.length; k++) {
        const file_id = assignedFiles[k].file_id;
        let fileDetails = await File_Uplode.findOne({
          file_id: file_id,
        }).lean();

        if (fileDetails) {
          const loanStatusDetails = await LoanStatus.findOne({
            loanstatus_id: fileDetails.status,
          }).lean();

          if (loanStatusDetails) {
            fileDetails.status = loanStatusDetails.loanstatus;
            fileDetails.status_color = loanStatusDetails.color;
          }

          const userDetails = await AddUser.findOne({
            user_id: fileDetails.user_id,
          }).lean();

          if (userDetails) {
            fileDetails.user_details = userDetails;
          }

          // Fetch loan details using loan_id
          const loanDetails = await Loan.findOne({
            loan_id: fileDetails.loan_id,
          }).lean();

          if (loanDetails) {
            fileDetails.loan_details = loanDetails;
          }
        }

        assignedFiles[k] = {
          ...assignedFiles[k],
          file_details: fileDetails,
        };
      }

      branchUsers[j].files = assignedFiles;
    }

    branch.users = branchUsers;

    data = await Promise.all(
      data.map(async (user) => {
        const count = await Branch_Assign.countDocuments({
          branchuser_id: user.branchuser_id,
        });

        // Find files for this user
        const userFiles = await Branch_Assign.find({
          branchuser_id: user.branchuser_id,
        }).lean();

        for (let k = 0; k < userFiles.length; k++) {
          const file_id = userFiles[k].file_id;
          let fileDetails = await File_Uplode.findOne({
            file_id: file_id,
          }).lean();

          if (fileDetails) {
            const loanStatusDetails = await LoanStatus.findOne({
              loanstatus_id: fileDetails.status,
            }).lean();

            if (loanStatusDetails) {
              fileDetails.status = loanStatusDetails.loanstatus;
              fileDetails.status_color = loanStatusDetails.color;
            }

            const userDetails = await AddUser.findOne({
              user_id: fileDetails.user_id,
            }).lean();

            if (userDetails) {
              fileDetails.user_details = userDetails;
            }

            // Fetch loan details using loan_id
            const loanDetails = await Loan.findOne({
              loan_id: fileDetails.loan_id,
            }).lean();

            if (loanDetails) {
              fileDetails.loan_details = loanDetails;
            }
          }

          userFiles[k] = {
            ...userFiles[k],
            file_details: fileDetails,
          };
        }

        return { ...user, assigned_file_count: count, files: userFiles };
      })
    );

    const totalCount = data.reduce(
      (acc, user) => acc + (user.assigned_file_count || 0),
      0
    );
    const count = data.length;

    res.json({
      success: true,
      branch,
      data: data,
      count: count,
      totalCount,
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
    const searchTerm = req.query.searchTerm
      ? req.query.searchTerm.toLowerCase()
      : "";
    const selectedLoan = req.query.selectedLoan || "";
    const selectedLoanSubType = req.query.selectedSubtype || "";
    const selectedStatus = req.query.selectedStatus
      ? req.query.selectedStatus.toLowerCase()
      : "";
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

    if (selectedLoan !== "all loan types" && selectedLoan !== "") {
      matchStage.loan_id = selectedLoan;
    }
    if (selectedLoanSubType) {
      matchStage.loantype_id = selectedLoanSubType;
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
    const statusIds = data.map((item) => item.status);

    const [
      branchUserData,
      userData,
      loanData,
      loanTypeData,
      completeSteps,
      documentData,
      countData,
      loanStatusData,
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
        "file_id statusMessage loan_step status inputs loan_step_id"
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
          const fileData = await File_Uplode.findOne({ file_id }).select(
            "loan_id loantype_id documents"
          );
          const loanIds = fileData.documents.map((doc) => ({
            loan_document_id: doc.loan_document_id,
            title_id: doc.title_id,
          }));
          const data2 = await Loan_Documents.find({
            loan_id: fileData.loan_id,
            loantype_id: fileData.loantype_id,
          }).select("document_ids title_id");
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
      LoanStatus.find({ loanstatus_id: { $in: statusIds } }).select(
        "loanstatus_id loanstatus color"
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
    const statusMessageMap = new Map();
    const amountMap = new Map();
    const loanStatusMap = new Map(
      loanStatusData.map((status) => [status.loanstatus_id.toString(), status])
    );

    completeSteps.forEach((step) => {
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

    const stepsPromises = data.map(async (item) => {
      try {
        const stepsResponse = await axios.get(
          `https://admin.savajcapital.com/api/loan_step/get_all_steps/${item.file_id}`
        );
        const stepsData = stepsResponse.data.data;

        const rejectedStep = stepsData.find((step) => step.status === "reject");
        const activeStep = stepsData.find((step) => step.status === "active");

        if (rejectedStep) {
          item.running_step_name = rejectedStep.loan_step;
        } else if (activeStep) {
          item.running_step_name = activeStep.loan_step;
        } else {
          const lastIndex = stepsData.length - 1;
          item.running_step_name = stepsData[lastIndex].loan_step;
        }
      } catch (error) {
        console.error(
          `Error fetching steps for file_id ${item.file_id}:`,
          error.message
        );
      }
    });

    await Promise.all(stepsPromises);

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

      if (loanStatusMap.has(item.status)) {
        const loanStatus = loanStatusMap.get(item.status);
        item.status = loanStatus.loanstatus;
        item.color = loanStatus.color;
      }

      const countInfo = countData.find((info) => info.file_id === item.file_id);
      if (countInfo) {
        item.document_percentage = countInfo.document_percentage;
      }
    }

    res.json({
      statusCode: 200,
      data,
      branchUsersData: branchUsersData,
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
