var express = require("express");
var router = express.Router();
const AddUser = require("../models/AddUser");
const BankUser = require("../models/Bank/BankUserSchema");
const SuperAdmin = require("../models/SuperAdminSignupSchema");
const SavajCapitalUser = require("../models/SavajCapitalUser");
var emailService = require("./emailService");
const crypto = require("crypto");

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "mansi");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (text) => {
  const decipher = crypto.createDecipher("aes-256-cbc", "mansi");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

// ============================ Reset Password ==================================
const tokenExpirationMap = new Map();

function isTokenValid(email) {
  const token = encrypt(email);
  const expirationTimestamp = tokenExpirationMap.get(token);
  console.log(
    `Token: ${token}, Expiration: ${new Date(
      expirationTimestamp
    )}, Current: ${new Date()}`
  );

  return expirationTimestamp && Date.now() < expirationTimestamp;
}

router.post("/passwordmail", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("object", email);
    const encryptedEmail = encrypt(email);

    console.log("object", encryptedEmail);
    const token = encryptedEmail;

    const expirationTime = 2 * 24 * 60 * 60 * 1000;

    const expirationTimestamp = Date.now() + expirationTime;
    tokenExpirationMap.set(token, expirationTimestamp);

    const subject = "Welcome to your new resident center with Savaj Capital";

    const text = `
    <p>Hello Sir/Ma'am,</p>

        <p>Reset your password now:</p>
        <p><a href="${
          `https://saas.cloudrentalmanager.com/auth/changepassword?token=` +
          token
        }" style="text-decoration: none;">Reset Password Link</a></p>
        
        <p>Best regards,<br>
        The Savaj Capital Team</p>
    `;

    await emailService.sendWelcomeEmail(req.body.email, subject, text);

    res.json({
      statusCode: 200,
      data: info,
      message: "Send Mail Successfully",
    });

    scheduleTokenCleanup();
  } catch (error) {
    res.json({
      statusCode: false,
      message: error.message,
    });
  }
});

function scheduleTokenCleanup() {
  setInterval(() => {
    const currentTimestamp = Date.now();

    for (const [token, expirationTimestamp] of tokenExpirationMap.entries()) {
      if (currentTimestamp > expirationTimestamp) {
        tokenExpirationMap.delete(token);
        console.log(
          `Token generated for email: ${decrypt(token)}, Expiration: ${new Date(
            expirationTimestamp
          )}`
        );
      }
    }
  }, 15 * 60 * 1000);
}

router.get("/check_token_status/:token", (req, res) => {
  const { token } = req.params;
  const expirationTimestamp = tokenExpirationMap.get(token);

  if (expirationTimestamp && Date.now() < expirationTimestamp) {
    res.json({ expired: false });
  } else {
    res.json({ expired: true });
  }
});

router.put("/reset_password/:mail", async (req, res) => {
  try {
    const encryptmail = req.params.mail;
    const email = decrypt(encryptmail);
    console.log("email", email);

    if (!isTokenValid(email)) {
      return res.json({
        statusCode: 401,
        message: "Token expired. Please request a new password reset email.",
      });
    }

    const newPassword = req.body.password;
    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required.",
      });
    }

    const hashConvert = encrypt(newPassword);
    const updateData = { password: hashConvert };

    let result = null;
    let collection = null;

    const adminData = await SuperAdmin.findOne({
      email,
    });
    if (adminData) {
      console.log("admin");
      result = await SuperAdmin.findOneAndUpdate(
        { email: email },
        { password: updateData.password },
        { new: true }
      );

      if (result) {
        collection = "admin-register";
      }
    } else {
      const collections = [SavajCapitalUser, BankUser, AddUser];
      for (const Collection of collections) {
        result = await Collection.findOneAndUpdate(
          {
            [`${Collection.modelName.toLowerCase()}_email`]: email,
            is_delete: false,
          },
          {
            $set: {
              [`${Collection.modelName.toLowerCase()}_password`]: updateData.password,
            },
          },
          { new: true }
        );

        if (result) {
          console.log(result, "====");
          collection = Collection.modelName;
          break;
        }
      }
    }
    console.log("result", result);
    if (result) {
      tokenExpirationMap.delete(encrypt(email));
      let url;
      if (collection === "admin-register") {
        url = "/auth/login";
      } else {
        const adminData = await Admin_Register.findOne({
          admin_id: result.admin_id,
          isAdmin_delete: false,
        });
        url = `/auth/${adminData.company_name}/${collection}/login`;
      }

      return res.status(200).json({
        data: result,
        url,
        message: `Password Updated Successfully for ${collection}`,
      });
    } else {
      return res.status(404).json({
        message:
          "No matching record found for the provided email in any collection",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
