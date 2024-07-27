const express = require("express");
const router = express.Router();
const moment = require("moment");
const Bank = require("../../models/Bank/BankSchema");
const BankUser = require("../../models/Bank/BankUserSchema");
const AddUser = require("../../models/AddUser");
const SuperAdmin = require("../../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const { createToken } = require("../../utils/authhelper");
const crypto = require("crypto");
const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
const BankApproval = require("../../models/Bank/BankApproval");
const File_Uplode = require("../../models/File/File_Uplode");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Loan_Documents = require("../../models/Loan/Loan_Documents");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const AddDocuments = require("../../models/AddDocuments/AddDocuments");
const Title = require("../../models/AddDocuments/Title");
const Loan_Step = require("../../models/Loan_Step/Loan_Step");
const SavajCapital_BranchAssign = require("../../models/Savaj_Capital/Branch_Assign");
const Compelete_Step = require("../../models/Loan_Step/Compelete_Step");
const Guarantor_Step = require("../../models/AddGuarantor/GuarantorStep");
const Guarantor = require("../../models/AddGuarantor/AddGuarantor");
const BranchAssign = require("../../models/Savaj_Capital/Branch_Assign");
const axios = require("axios");
const LoanStatus = require("../../models/AddDocuments/LoanStatus");
const emailService = require("../emailService");

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
  // Check if the text contains hexadecimal characters (indicative of encryption)
  const isEncrypted = /[0-9A-Fa-f]{6}/.test(text);

  // If the text is encrypted, decrypt it
  if (isEncrypted) {
    const decipher = crypto.createDecipher("aes-256-cbc", "vaibhav");
    let decrypted = decipher.update(text, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } else {
    // If the text is not encrypted, return it as is
    return text;
  }
};

router.post("/", async (req, res) => {
  try {
    let savajUser = await SavajCapital_User.findOne({
      email: req.body.email,
    });

    const user = await AddUser.findOne({ email: req.body.email });
    const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (savajUser || user || bankUser || superAdmin) {
      res.json({
        statusCode: 201,
        message: `${req.body.branch_name} Name Already Added`,
      });
    }
    // Number find in savaj-capital user
    let findMobileNumber = await SavajCapital_User.findOne({
      number: req.body.mobile,
    });

    // Number find in Bank user
    const numberExistsInBankUser = await BankUser.findOne({
      mobile: req.body.mobile,
    });

    // Number find in Add user
    const userNumberExists = await AddUser.findOne({
      number: req.body.mobile,
    });

    if (numberExistsInBankUser || userNumberExists || findMobileNumber) {
      return res
        .status(200)
        .send({ statusCode: 202, message: "Mobile number already in use" });
    }

    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    const hashedPassword = encrypt(req.body.password);
    req.body["bankuser_id"] = uniqueId;
    req.body["createdAt"] = currentDate;
    req.body["updatedAt"] = currentDate;
    req.body["password"] = hashedPassword;

    var data = await BankUser.create(req.body);
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
        message: "Add Branch Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Bank Delete
router.delete("/:bank_id", async (req, res) => {
  try {
    const { bank_id } = req.params;

    const bankExistsInBankUser = await BankUser.findOne({ bank_id: bank_id });
    const bankExistsInBankApproval = await BankApproval.findOne({
      bank_id: bank_id,
    });

    if (bankExistsInBankUser || bankExistsInBankApproval) {
      return res.status(200).json({
        statusCode: 201,
        message: "Bank cannot be deleted because it is currently assigned.",
      });
    }

    const deletedUser = await Bank.findOneAndDelete({
      bank_id: bank_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 202,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedBankId: bank_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/:bankuser_id", async (req, res) => {
  try {
    const { bankuser_id } = req.params;
    let findEmail = await SavajCapital_User.findOne({
      email: req.body.email,
    });
    const user = await AddUser.findOne({ email: req.body.email });
    //   const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (findEmail || superAdmin || user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    const hashedPassword = encrypt(req.body.password);
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    req.body.password = hashedPassword;
    // if (!req.body.password) {
    //   delete req.body.password;
    // }
    const result = await BankUser.findOneAndUpdate(
      { bankuser_id: bankuser_id },
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

router.get("/:bank_id", async (req, res) => {
  try {
    const bank_id = req.params.bank_id;

    var data = await BankUser.aggregate([
      {
        $match: { bank_id: bank_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    const bank = await Bank.findOne({
      bank_id: bank_id,
    }).lean(); // Use lean() to get plain JavaScript objects

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    const bankUserCount = await BankUser.countDocuments({ bank_id });
    bank.user_count = bankUserCount;

    const bankUsers = await BankUser.find({ bank_id }).lean();

    for (let j = 0; j < bankUsers.length; j++) {
      const bankuser_id = bankUsers[j].bankuser_id;

      const assignedFiles = await BankApproval.find({ bankuser_id }).lean();

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

      bankUsers[j].files = assignedFiles;
    }

    bank.users = bankUsers;

    data = await Promise.all(
      data.map(async (user) => {
        const count = await BankApproval.countDocuments({
          bankuser_id: user.bankuser_id,
        });

        // Find files for this user
        const userFiles = await BankApproval.find({
          bankuser_id: user.bankuser_id,
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
      bank,
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

// Bank User Delete
router.delete("/deletebankuser/:bankId", async (req, res) => {
  try {
    const { bankId } = req.params;

    const bankUserExistsInBankApproval = await BankApproval.findOne({
      bankuser_id: bankId,
    });

    if (bankUserExistsInBankApproval) {
      return res.status(200).json({
        statusCode: 201,
        message:
          "Bank-user cannot be deleted because it is currently assigned.",
      });
    }

    const deletedBankUser = await BankUser.findOneAndDelete({
      bankuser_id: bankId,
    });

    if (!deletedBankUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      message: "Bank User deleted successfully",
      deletedBankUserId: bankId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/assigned_file/:bankuser_id", async (req, res) => {
  try {
    const bankuser_id = req.params.bankuser_id;

    const bankApprovals = await BankApproval.find({
      bankuser_id: bankuser_id,
    }).sort({ updatedAt: -1 });

    const bankUserData = await BankUser.findOne({ bankuser_id: bankuser_id });

    const fileIds = bankApprovals.map((approval) => approval.file_id);

    const fileDetails = await File_Uplode.find({ file_id: { $in: fileIds } });

    const augmentedData = await Promise.all(
      bankApprovals.map(async (approval) => {
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
      bankUserData: bankUserData,
      message: "Bank approvals data with all details retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/assignedbank_file/:bankuser_id", async (req, res) => {
  try {
    const bankuser_id = req.params.bankuser_id;
    const bankUserData = await BankUser.findOne({ bankuser_id: bankuser_id });

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
    const bankApprovals = await BankApproval.find({
      bankuser_id: bankuser_id,
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
          `http://localhost:5882/api/loan_step/get_all_steps/${item.file_id}`
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
      bankUserData: bankUserData,
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

router.delete("/assigedfile_delete/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    const deletedUser = await BankApproval.findOneAndDelete({
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
