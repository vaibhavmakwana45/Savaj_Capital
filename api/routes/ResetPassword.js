var express = require("express");
const router = express.Router();
const AddUser = require("../models/AddUser");
const BankUser = require("../models/Bank/BankUserSchema");
const SuperAdmin = require("../models/SuperAdminSignupSchema");
const SavajCapitalUser = require("../models/Savaj_Capital/SavajCapital_User");
const emailService = require("./emailService");
const crypto = require("crypto");

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
// ============================ Reset Password ==================================
const tokenExpirationMap = new Map();

function isTokenValid(email) {
  const token = encrypt(email);
  const isValid = tokenExpirationMap.has(token);

  return isValid;
}

// router.post("/passwordmail", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const encryptedEmail = encrypt(email);
//     const token = encryptedEmail;
//     tokenExpirationMap.set(token, true);

//     const subject = "Welcome to your new resident center with Savaj Capital";

//     const logoUrl =
//       "https://lh5.googleusercontent.com/p/AF1QipOyJre2lxZ1x9J76oq6yEXQptAixuoq8Kv0-bXU";
//     const passwordResetLink = `https://admin.savajcapital.com/auth/setpassword?token=${token}`;

//     const htmlContent = `
//       <div style="font-family: 'Arial', sans-serif; color: #333;">
//         <table width="100%" cellpadding="0" cellspacing="0">
//           <tr>
//             <td align="center">
//               <table width="600" cellpadding="20" cellspacing="0" style="border: 1px solid #ccc; margin-top: 20px;">
//                 <tr style="background-color: #f8f8f8;">
//                   <td align="center" style="padding: 10px;">
//                     <img src="${logoUrl}" alt="Savaj Capital Logo" style="height: 100px; width: 200px;"/>
//                   </td>
//                 </tr>
//                 <tr>
//                   <td style="font-size: 16px; padding: 20px;">
//                     <p>Hello,</p>
//                     <p>Thank you for registering with Savaj Capital. To complete your registration, please set up your password by clicking on the link below:</p>
//                     <p><a href="${passwordResetLink}" style="background-color: #0046d5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Your Password</a></p>
//                     <p>If the button above does not work, paste this link into your browser:</p>
//                     <p><a href="${passwordResetLink}" style="color: #0046d5; text-decoration: none;">${passwordResetLink}</a></p>
//                     <p>Best regards,<br>The Savaj Capital Team</p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>
//         </table>
//       </div>
//     `;

//     await emailService.sendWelcomeEmail(email, subject, htmlContent);

//     res.json({
//       statusCode: 200,
//       message: "Email sent successfully",
//     });

//     scheduleTokenCleanup();
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/passwordmail", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const encryptedEmail = encrypt(email);

//     const token = encryptedEmail;

//     tokenExpirationMap.set(token, true);

//     const subject = "Welcome to your new resident center with Savaj Capital";

//     const text = `
//     <p>Hello Sir/Ma'am,</p>

//         <p>Set your password now:</p>
//         <p><a href="${
//           `https://admin.savajcapital.com/auth/setpassword?token=` + token
//         }" style="text-decoration: none;">Set Password Link</a></p>

//         <p>Best regards,<br>
//         The Savaj Capital Team</p>
//     `;

//     await emailService.sendWelcomeEmail(req.body.email, subject, text);

//     res.json({
//       statusCode: 200,
//       // data: info,
//       message: "Send Mail Successfully",
//     });

//     scheduleTokenCleanup();
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// });

router.post("/passwordmail", async (req, res) => {
  try {
    const { email } = req.body;
    const encryptedEmail = encrypt(email);
    const token = encryptedEmail;

    tokenExpirationMap.set(token, true);

    const subject = "Welcome to Your New Resident Center with Savaj Capital";

    // Logo URL
    const logoUrl = "https://cdn.dohost.in/upload/629imgpsh_fullsize_anim.jpg";

    const text = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          background-color: #ffffff;
          width: 100%;
          max-width: 600px;
          margin: 30px auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          border-top: 5px solid #b19552;
          text-align: center; /* Ensure text and elements within the container are centered */
        }
        .button {
          background-color: #b19552;
          color: #ffffff;
          padding: 10px 20px; /* Smaller padding for a smaller button */
          text-align: center;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin-top: 20px;
          display: inline-block; /* This allows the button to be centered via text-align of its parent */
        }
        .button:hover {
          background-color: #967c42;
        }
        p {
          color: rgb(65, 70, 80);
          line-height: 1.8;
          font-size: 16px;
          margin-top: 20px;
        }
        .header {
          color: #b19552;
          font-size: 24px;
        }
        .logo {
          display: block;
          margin: 20px auto; /* Center the logo */
          width: 160px; /* Adjust based on your logo's aspect ratio */
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${logoUrl}" alt="Savaj Capital Logo" class="logo">
        <h1 class="header">Welcome to Savaj Capital</h1>
        <p>Hello,</p>
        <p>Thank you for joining Savaj Capital. Please set your password by clicking the button below to activate your account:</p>
        <a href="${
          `https://admin.savajcapital.com/auth/setpassword?token=` + token
        }" class="button">Set Your Password</a>
        <p>If you did not request this email, please ignore it.</p>
        <p>Best regards,<br>The Savaj Capital Team</p>
      </div>
    </body>
    </html>
    `;

    await emailService.sendWelcomeEmail(email, subject, text);

    res.json({
      statusCode: 200,
      message: "Send Mail Successfully",
    });

    scheduleTokenCleanup();
  } catch (error) {
    res.json({
      statusCode: 500,
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
      }
    }
  }, 15 * 60 * 1000);
}

router.get("/check_token_status/:token", (req, res) => {
  const { token } = req.params;
  const isValid = tokenExpirationMap.has(token);

  if (isValid) {
    res.json({ expired: false });
  } else {
    res.json({ expired: true });
  }
});

router.put("/reset_password/:mail", async (req, res) => {
  try {
    const encryptmail = req.params.mail;
    const email = decrypt(encryptmail);
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
            email: email,
          },
          {
            $set: {
              password: updateData.password,
            },
          },
          { new: true }
        );

        if (result) {
          collection = Collection.modelName;
          break;
        }
      }
    }
    if (result) {
      tokenExpirationMap.delete(encrypt(email));

      return res.status(200).json({
        data: result,
        url: "/auth/signin",
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
