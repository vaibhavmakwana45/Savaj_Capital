const express = require("express");
const router = express.Router();
const moment = require("moment");
const SavajCapital_Role = require("../../models/Savaj_Capital/SavajCapital_Role");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");

router.post("/", async (req, res) => {
  try {
    let findRole = await SavajCapital_Role.findOne({
      role: req.body.role,
    });
    if (!findRole) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["role_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      var data = await SavajCapital_Role.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Role Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.role} Role Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get All Role
router.get("/", async (req, res) => {
  try {
    const data = await SavajCapital_Role.find({}).sort({ updatedAt: -1 });
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Update Role
router.put("/:role_id", async (req, res) => {
  try {
    const { role_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await SavajCapital_Role.findOneAndUpdate(
      { role_id: role_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Role Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Role not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/:role_id", async (req, res) => {
  try {
    const role_id = req.params.role_id;
    const data = await SavajCapital_Branch.findOne({ role_id });

    if (!data) {
      return res.status(200).json({
        statusCode: 201,
        message: "Role not found",
      });
    }
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Delete Role
router.delete("/:role_id", async (req, res) => {
  try {
    const { role_id } = req.params;

    const roleExistsInSavajUser = await SavajCapital_User.findOne({
      role_id: role_id,
    });

    if (roleExistsInSavajUser) {
      return res.status(200).json({
        statusCode: 201,
        message:
          "Role cannot be deleted because it is currently assigned to a SC-User.",
      });
    }

    const user = await SavajCapital_User.findOne({
      role_id: role_id,
    });

    if (user) {
      return res.status(200).json({
        statusCode: 201,
        message: "This Role is already in use",
      });
    }

    const deletedUser = await SavajCapital_Role.findOneAndDelete({
      role_id: role_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 202,
        message: "Role not found",
      });
    }

    res.json({
      success: true,
      message: "Role deleted successfully",
      deletedRoleId: role_id,
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
