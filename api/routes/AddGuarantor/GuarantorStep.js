const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan_Step = require("../../models/Loan_Step/Loan_Step");
const Guarantor_Step = require("../../models/AddGuarantor/GuarantorStep");
const Loan = require("../../models/Loan/Loan");
const File_Uplode = require("../../models/File/File_Uplode");
const { default: axios } = require("axios");

// router.post("/guarantor-step/:file_id", async (req, res) => {

//   try {
//     const { file_id } = req.params;
//     const { loan_step_id, inputs, user_id, loan_step } = req.body;

//     const existingStep = await Guarantor_Step.findOne({
//       loan_step_id,
//       file_id,
//       user_id,
//     });

//     if (existingStep) {
//       const newInputMap = new Map(inputs.map((input) => [input.label, input]));

//       existingStep.inputs = existingStep.inputs.map((input) => {
//         if (newInputMap.has(input.label)) {
//           return {
//             ...input,
//             ...newInputMap.get(input.label),
//           };
//         }
//         return input;
//       });

//       newInputMap.forEach((value, key) => {
//         if (!existingStep.inputs.some((input) => input.label === key)) {
//           existingStep.inputs.push(value);
//         }
//       });

//       existingStep.updatedAt = moment()
//         .utcOffset(330)
//         .format("YYYY-MM-DD HH:mm:ss");
//       await existingStep.save();

//       res.status(200).json({
//         statusCode: 200,
//         message: "Step Updated Successfully.",
//       });
//     } else {
//       const timestamp = Date.now();
//       const uniqueId = `${timestamp}`;
//       const newStep = {
//         compelete_step_id: uniqueId,
//         loan_step_id,
//         inputs,
//         loan_step,
//         status: "complete",
//         file_id,
//         user_id,
//         createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
//       };

//       await Guarantor_Step.create(newStep);

//       res.status(200).json({
//         statusCode: 200,
//         message: "Step Created Successfully.",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/guarantor-step/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const { loan_step_id, inputs, user_id, loan_step, guarantor_id } = req.body;

    const existingStep = await Guarantor_Step.findOne({
      guarantor_id,
      loan_step_id,
    });

    if (existingStep) {
      const newInputMap = new Map(inputs.map((input) => [input.label, input]));

      existingStep.inputs = existingStep.inputs.map((input) => {
        if (newInputMap.has(input.label)) {
          return {
            ...input,
            ...newInputMap.get(input.label),
          };
        }
        return input;
      });

      newInputMap.forEach((value, key) => {
        if (!existingStep.inputs.some((input) => input.label === key)) {
          existingStep.inputs.push(value);
        }
      });

      existingStep.updatedAt = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      await existingStep.save();

      res.status(200).json({
        statusCode: 200,
        message: "Step Updated Successfully.",
      });
    } else {
      // Create new step
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      const newStep = {
        compelete_step_id: uniqueId,
        loan_step_id,
        guarantor_id,
        inputs,
        loan_step,
        status: "complete",
        file_id,
        user_id,
        createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      };

      await Guarantor_Step.create(newStep);

      const logEntry = {
        log_id: `${moment().unix()}_${Math.floor(Math.random() * 1000)}`,
        message: `Guarantor step ${req.body.loan_step} added successfully`,
        timestamp: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      };

      await File_Uplode.findOneAndUpdate(
        { file_id: file_id },
        {
          $push: { logs: logEntry },
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        }
      );

      res.status(200).json({
        statusCode: 200,
        message: "Step Created Successfully.",
      });
    }
  } catch (error) {
    res.status(5000).json({
      statusCode: 5000,
      message: error.message,
    });
  }
});

router.get("/get_guarantor_steps/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const file = await File_Uplode.findOne({ file_id });
    const loan = await Loan.findOne({ loan_id: file.loan_id });
    const steps = [];

    for (const loan_step_id of loan.loan_step_id) {
      const stepData = await Loan_Step.findOne({ loan_step_id });

      if (!stepData) {
        continue;
      }

      if (loan_step_id === "1715348523661") {
        try {
          const res = await axios.get(
            `https://admin.savajcapital.com/api/file_upload/get_documents/${file_id}`
          );
          steps.push({ ...res.data.data, user_id: file.user_id });
        } catch (error) {
          console.error("Error: ", error.message);
        }
      } else {
        const compeleteStep = await Guarantor_Step.findOne({
          loan_step_id,
          file_id,
          user_id: file.user_id,
        });

        if (compeleteStep) {
          const updatedInputs = stepData.inputs.map((input) => {
            const existingInput = compeleteStep.inputs.find(
              (ci) => ci.label === input.label
            );
            return existingInput || input;
          });

          steps.push({
            ...compeleteStep.toObject(),
            inputs: updatedInputs,
            user_id: file.user_id,
          });
        } else {
          const isActive = stepData.inputs.some((input) => input.is_required);
          const status = isActive ? "active" : "complete";
          steps.push({
            ...stepData.toObject(),
            status,
            user_id: file.user_id,
          });
        }
      }
    }

    res.json({
      statusCode: 200,
      data: steps,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete(
  "/guarantor-step/:loan_step_id/:guarantor_id",
  async (req, res) => {
    const { loan_step_id, guarantor_id } = req.params;

    try {
      // Find and delete the guarantor step
      const result = await Guarantor_Step.findOneAndDelete({
        loan_step_id,
        guarantor_id,
      });

      if (result) {
        res.status(200).json({
          statusCode: 200,
          message: "Guarantor step deleted successfully.",
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          message: "Guarantor step not found.",
        });
      }
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }
);

module.exports = router;
