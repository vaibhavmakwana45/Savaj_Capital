const express = require("express");
const router = express.Router();
const moment = require("moment");
const AddAdmin = require("../models/AddAdmin");
const {
  hashPassword,
  hashCompare,
  createToken,
} = require("../utils/authhelper");

router.post("/addadmin", async (req, res) => {
  try {
    const { email, phonenumber } = req.body;

    const existingUser = await AddAdmin.findOne({
      $or: [{ email: email }, { phonenumber: phonenumber }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(401).json({
          success: false,
          message: "Email already in use",
        });
      } else if (existingUser.phonenumber === phonenumber) {
        return res.status(402).json({
          success: false,
          message: "Phone number already in use",
        });
      }
    }
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(5, 15);
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
      .toString()
      .padStart(10, "0");
    const uniqueId = `${timestamp}${randomString}${randomNumber}`;
    const userUniqueId = (req.body["user_id"] = uniqueId);
    const createTime = (req.body["createAt"] = moment().format(
      "YYYY-MM-DD HH:mm:ss"
    ));
    const updateTime = (req.body["updateAt"] = moment().format(
      "YYYY-MM-DD HH:mm:ss"
    ));
    const hashedPassword = await hashPassword(req.body.password);

    const newUser = new AddAdmin({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      companyname: req.body.companyname,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      username: req.body.username,
      password: hashedPassword,
      createAt: createTime,
      updateAt: updateTime,
      user_id: userUniqueId,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Admin SignUp Successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/getadmins", async (req, res) => {
  try {
    let admins = await AddAdmin.find({}, "-password");
    // Reverse the order of the admins array
    admins = admins.reverse();
    res.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/adminlogin", async (req, res) => {
  try {
    const user = await AddAdmin.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin does not exist",
      });
    }

    const compare = await hashCompare(req.body.password, user.password);

    if (!compare) {
      return res.status(422).json({
        success: false,
        message: "Wrong password",
      });
    }

    const { token, expiresIn } = await createToken(user);

    res.json({
      success: true,
      data: user,
      expiresAt: expiresIn,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
});

router.put("/togglestatus/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["activate", "deactivate"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const admin = await AddAdmin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.status = status === "activate" ? "activate" : "deactivate";
    await admin.save();

    res.json({
      success: true,
      message: `Admin status updated to ${status}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/deleteadmin/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await AddAdmin.findOneAndDelete({ user_id: userId });
    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/editadmin/:userId", async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedAdmin = await AddAdmin.findOneAndUpdate(
      { user_id: userId },
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Admin data updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/countadmins", async (req, res) => {
  try {
    const count = await AddAdmin.countDocuments();
    res.json({
      success: true,
      count: count,
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
