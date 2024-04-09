const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const saltRound = 10;

const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(pwd, salt);
  return hash;
};

const hashCompare = async (pwd, hash) => {
  try {
    const result = await bcrypt.compare(pwd, hash);
    return result;
  } catch (error) {
    console.error("Error in hash comparison:", error);
    throw error;
  }
};

const bankUserToken = async (
  _id,
  bankuser_id,
  bank_id,
  email,
  createdAt,
  updatedAt
) => {
  const payload = {
    _id: _id,
    bankuser_id: bankuser_id,
    bank_id: bank_id,
    email: email,
    role: "bankuser",
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  const token = await JWT.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  const decoded = JWT.verify(token, secret);
  const expiresIn = new Date(decoded.exp * 1000);

  return { token, expiresIn };
};

const superAdminToken = async (
  _id,
  superadmin_id,
  firstname,
  lastname,
  email,
  phonenumber,
  createdAt,
  updatedAt
) => {
  const payload = {
    _id: _id,
    superadmin_id: superadmin_id,
    email: email,
    role: "superadmin",
    firstname: firstname,
    lastname: lastname,
    phonenumber: phonenumber,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  const token = await JWT.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  const decoded = JWT.verify(token, secret);
  const expiresIn = new Date(decoded.exp * 1000);

  return { token, expiresIn };
};

const savajCapitalUserToken = async (
  _id,
  branchuser_id,
  role_id,
  branch_id,
  email,
  createdAt,
  updatedAt
) => {
  const payload = {
    _id: _id,
    branchuser_id: branchuser_id,
    role_id: role_id,
    branch_id: branch_id,
    email: email,
    role: "savajcapitaluser",
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  const token = await JWT.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  const decoded = JWT.verify(token, secret);
  const expiresIn = new Date(decoded.exp * 1000);

  return { token, expiresIn };
};

const userToken = async (_id, user_id, email, number, createdAt, updatedAt) => {
  const payload = {
    _id: _id,
    user_id: user_id,
    email: email,
    number: number,
    role: "user",
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  const token = await JWT.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  const decoded = JWT.verify(token, secret);
  const expiresIn = new Date(decoded.exp * 1000);

  return { token, expiresIn };
};
module.exports = {
  hashPassword,
  hashCompare,
  bankUserToken,
  superAdminToken,
  savajCapitalUserToken,
  userToken,
};
