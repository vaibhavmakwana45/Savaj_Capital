const express = require("express");
const router = express.Router();
const moment = require("moment");
const Guarantor = require("../../models/AddGuarantor/AddGuarantor");
const Guarantor_Step = require("../../models/AddGuarantor/GuarantorStep");
const File_Uplode = require("../../models/File/File_Uplode");

router.post("/add-guarantor", async (req, res) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  const randomNumber = Math.floor(Math.random() * Math.pow(10, 10))
    .toString()
    .padStart(10, "0");
  const guarantorId = `${timestamp}${randomString}${randomNumber}`;

  try {
    const {
      username,
      number,
      email,
      pan_card,
      aadhar_card,
      unit_address,
      occupation,
      reference,
      file_id,
      user_id,
    } = req.body;

    const newGuarantor = new Guarantor({
      guarantor_id: guarantorId,
      file_id,
      user_id,
      username,
      number,
      email,
      pan_card,
      aadhar_card,
      unit_address,
      occupation,
      reference,
      createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    });

    const savedGuarantor = await newGuarantor.save();

    const logEntry = {
      log_id: `${moment().unix()}_${Math.floor(Math.random() * 1000)}`,
      message: `New Guarantor added ${username}`,
      // guarantor_id: guarantorId,
      timestamp: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    };

    await File_Uplode.findOneAndUpdate(
      { file_id },
      {
        $push: { logs: logEntry },
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      }
    );

    res.json({
      success: true,
      message: "Guarantor added successfully",
      data: savedGuarantor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/guarantors/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const guarantors = await Guarantor.find({ file_id: file_id });

    if (guarantors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No guarantors found for the provided file ID",
      });
    }

    res.json({
      success: true,
      data: guarantors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/delete-guarantor/:guarantor_id", async (req, res) => {
  const { guarantor_id } = req.params;

  try {
    const associatedSteps = await Guarantor_Step.find({
      guarantor_id: guarantor_id,
    });

    if (associatedSteps.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete guarantor because it is associated with one or more steps",
      });
    }

    const deletedGuarantor = await Guarantor.findOneAndDelete({
      guarantor_id: guarantor_id,
    });

    if (!deletedGuarantor) {
      return res.status(404).json({
        success: false,
        message: "Guarantor not found",
      });
    }

    res.json({
      success: true,
      message: "Guarantor deleted successfully",
    });
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/update-guarantor/:guarantor_id", async (req, res) => {
  const { guarantor_id } = req.params;
  const {
    username,
    number,
    email,
    pan_card,
    aadhar_card,
    unit_address,
    occupation,
    reference,
    file_id,
    user_id,
  } = req.body;

  try {
    const updatedGuarantor = await Guarantor.findOneAndUpdate(
      { guarantor_id: guarantor_id },
      {
        username,
        number,
        email,
        pan_card,
        aadhar_card,
        unit_address,
        occupation,
        reference,
        file_id,
        user_id,
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      },
      { new: true }
    );

    if (!updatedGuarantor) {
      return res.status(404).json({
        success: false,
        message: "Guarantor not found",
      });
    }

    res.json({
      success: true,
      message: "Guarantor updated successfully",
      data: updatedGuarantor,
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
