// emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "ip32portal@gmail.com",
    pass: "urfszbvriwpqjnux",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendWelcomeEmail(toEmail, subject, htmlContent) {
  const info = await transporter.sendMail({
    from: "ip32portal@gmail.com",
    to: toEmail,
    subject: subject,
    html: htmlContent,
  });
}

module.exports = {
  sendWelcomeEmail,
};
