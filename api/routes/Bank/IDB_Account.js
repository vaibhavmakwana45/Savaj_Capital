const express = require("express");
const router = express.Router();
const moment = require("moment");
const IDB_Account = require("../../models/Bank/IDB_Account");
const AddUser = require("../../models/AddUser");
const File_Uplode = require("../../models/File/File_Uplode");

router.post("/", async (req, res) => {
  try {
    const uniqueId = `F${moment().format("YYYYMMDDHHmmss")}`;
    req.body["account_id"] = `${uniqueId}`;
    req.body["status"] = `complete`;
    const account = await IDB_Account.create(req.body);
    res.json({
      statusCode: 200,
      message: `Account Added Successfully`,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/get_account/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const account = await IDB_Account.findOne({ file_id });
    if (account) {
      res.json({
        statusCode: 200,
        data: { ...account.toObject(), loan_step: "Bank A/C Open" },
      });
    } else {
      const file = await File_Uplode.findOne({ file_id });
      const user = await AddUser.findOne({ user_id: file.user_id });
      const object = {
        file_id,
        user_id: user.user_id,
        account_number: "",
        ifc_number: "",
        name: user.username,
        status: "active",
        loan_step: "Bank A/C Open",
      };
      res.json({
        statusCode: 200,
        data: object,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
