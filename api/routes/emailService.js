const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@savajcapital.com",
    pass: "AApp@00.com",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendWelcomeEmail(toEmail, subject, htmlContent) {
  const info = await transporter.sendMail({
    from: '"Savaj Capital" <no-reply@savajcapital.com>',
    to: toEmail,
    subject: subject,
    html: htmlContent,
  });
}

module.exports = {
  sendWelcomeEmail,
};
