const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const saltRound = 10;

// write a function to convert password into hash
const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(pwd, salt);
  return hash;
};

//write a function compare the hashpwd and pwd
const hashCompare = async (pwd, hash) => {
  try {
    const result = await bcrypt.compare(pwd, hash);
    return result;
  } catch (error) {
    console.error('Error in hash comparison:', error);
    throw error; // Rethrow the error to handle it accordingly in your code
  }
};

// write a function to create token
// const createToken = async (
//   id,
//   email,
//   username,
//   phone,
//   industry,
//   companyName,
//   teamSize,
//   companyRevenue,
//   priority,
//   lastThing
// ) => {
//   const token = await JWT.sign(
//     {
//       userId: id,
//     },
//     {
//       email: email,
//     },
//     {
//       username: username,
//     },
//     {
//       phone: phone,
//     },
//     {
//       industry: industry,
//     },
//     {
//       companyName: companyName,
//     },
//     {
//       teamSize: teamSize,
//     },
//     {
//       companyRevenue: companyRevenue,
//     },
//     {
//       priority: priority,
//     },
//     {
//       lastThing: lastThing,
//     },
//     secret,
//     {
//       expiresIn: process.env.JWT_EXPIRATION_TIME,
//     }
//   );
//   const decoded = JWT.verify(token, secret);
//   const expiresIn = new Date(decoded.exp * 1000);
//   return { token, expiresIn };
// };

const createToken = async (id, firstname, lastname, email, phonenumber, username, companyname) => {
  const payload = {
    userId: id,
    email: email,
    firstname: firstname,
    lastname: lastname,
    phonenumber: phonenumber,
    username: username,
    companyname: companyname,
  };

  const token = await JWT.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  const decoded = JWT.verify(token, secret);
  const expiresIn = new Date(decoded.exp * 1000);

  return { token, expiresIn };
};

// const clientToken = async (
//   id,
//   client_id,
//   user_id,
//   first_name,
//   last_name,
//   company_name,
//   contact_info,
//   phone,
//   email_info,
//   email,
//   client_details,
//   createdAt,
//   updatedAt,
// ) => {
//   const payload = {
//     id: id,
//     client_id: client_id,
//     user_id: user_id,
//     first_name: first_name,
//     last_name: last_name,
//     company_name: company_name,
//     contact_info: contact_info,
//     phone: phone,
//     email_info: email_info,
//     email: email,
//     client_details: client_details,
//     createdAt: createdAt,
//     updatedAt: updatedAt,
//   };

//   const token = await JWT.sign(payload, secret, {
//     expiresIn: process.env.JWT_EXPIRATION_TIME,
//   });

//   const decoded = JWT.verify(token, secret);
//   const expiresIn = new Date(decoded.exp * 1000);

//   return { token, expiresIn };
// };

module.exports = { hashPassword, hashCompare ,createToken };
