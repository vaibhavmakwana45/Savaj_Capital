const express = require("express");
const router = express.Router();
const moment = require("moment");
const Guarantor = require("../../models/AddGuarantor/AddGuarantor");

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

module.exports = router;
