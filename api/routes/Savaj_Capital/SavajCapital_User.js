const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddUser = require("../../models/AddUser");
const BankUser = require("../../models/Bank/BankUserSchema");
const SuperAdmin = require("../../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const SavajCapital_Role = require("../../models/Savaj_Capital/SavajCapital_Role");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const crypto = require("crypto");
const axios = require("axios");

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "vaibhav");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (text) => {
  const decipher = crypto.createDecipher("aes-256-cbc", "vaibhav");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

router.post("/", async (req, res) => {
  try {
    let findEmail = await SavajCapital_User.findOne({
      email: req.body.email,
    });

    const user = await AddUser.findOne({ email: req.body.email });
    const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (findEmail || bankUser || superAdmin || user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    // if (!findEmail || !user || !bankUser || !superAdmin) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["branchuser_id"] = uniqueId;
    req.body["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    console.log("first");

    req.body.password = "";

    console.log(req.body.email);
    var data = await SavajCapital_User.create(req.body);
    console.log(data);
    const ApiResponse = await axios.post(
      `http://192.168.1.12:4000/api/setpassword/passwordmail`,
      {
        email: req.body.email,
      }
    );
    console.log(ApiResponse);

    if (ApiResponse.status === 200) {
      console.log("Password mail sent successfully");
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

    const branch = await SavajCapital_Branch.findOne({ branch_id });

    for (let i = 0; i < data.length; i++) {
      const role_id = data[i].role_id;

      const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });

      if (branch_data) {
        data[i].role = branch_data.role;
      }
    }

    const count = data.length;

    res.json({
      statusCode: 200,
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

router.put("/:branchuser_id", async (req, res) => {
  try {
    const { branchuser_id } = req.params;
    // let findEmail = await SavajCapital_User.findOne({
    //   email: req.body.email,
    // });
    // const user = await AddUser.findOne({ email: req.body.email });
    // const bankUser = await BankUser.findOne({ email: req.body.email });
    // const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    // if (findEmail || bankUser || superAdmin || user) {
    //   return res
    //     .status(200)
    //     .send({ statusCode: 201, message: "Email already in use" });
    // }

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    if (!req.body.password) {
      delete req.body.password;
    }
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

module.exports = router;
