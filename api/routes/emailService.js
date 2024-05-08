// // emailService.js
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com",
//   port: 465,
//   secure: false,
//   auth: {
//     user: "no-reply@savajcapital.com",
//     pass: "AApp@00.com",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// async function sendWelcomeEmail(toEmail, subject, htmlContent) {
//   const info = await transporter.sendMail({
//     from: "no-reply@savajcapital.com",
//     to: toEmail,
//     subject: subject,
//     html: htmlContent,
//   });
// }

// module.exports = {
//   sendWelcomeEmail,
// };

// emailService.js
const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "ip32portal@gmail.com",
//     pass: "urfszbvriwpqjnux",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// async function sendWelcomeEmail(toEmail, subject, htmlContent) {
//   const info = await transporter.sendMail({
//     from: "ip32portal@gmail.com",
//     to: toEmail,
//     subject: subject,
//     html: htmlContent,
//   });
// }

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
