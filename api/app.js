require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const initMongo = require("./config.js/mongo");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

const SuperAdminSignupRouter = require("./routes/SuperAdminSignupApi");
const AddUserRouter = require("./routes/AddUser");
const BankRouter = require("./routes/Bank/AddBanksRoutes");
const BankUserRouter = require("./routes/Bank/BankUser");
const SavajCapital_BranchRoutes = require("./routes/Savaj_Capital/SavajCapital_Branch"); // Branch
const SavajCapital_Role = require("./routes/Savaj_Capital/SavajCapital_Role"); // Role
const SavajCapital_UserRoutes = require("./routes/Savaj_Capital/SavajCapital_User"); // Role
const CountRoutes = require("./routes/Count"); // Role
const LoanRoutes = require("./routes/Loan/Loan"); // Loan
const Loan_Type = require("./routes/Loan/Loan_Type"); // Loan-Type
const Loan_Documents = require("./routes/Loan/Loan_Documents"); // Loan-Type
const PasswordRoutes = require("./routes/ResetPassword");
const FileUplodeRoutes = require("./routes/File/FileUplode");
const BankApprovalRoutes = require("./routes/Bank/BankApproval");
const LoanStepRoutes = require("./routes/Loan_Step/Loan_Step"); // Loan-Step
const AddDocumentsRoutes = require("./routes/AddDocumens/AddDocuments"); // Add-Documents
const TitleRoutes = require("./routes/AddDocumens/Title"); // Title
const BranchAssignRoutes = require("./routes/Savaj_Capital/Branch_Assign");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/superadminsignup", SuperAdminSignupRouter);
app.use("/api/addusers", AddUserRouter);
app.use("/api/addbankuser", BankRouter);
app.use("/api/bank_user", BankUserRouter);
app.use("/api/branch", SavajCapital_BranchRoutes);
app.use("/api/role", SavajCapital_Role);
app.use("/api/savaj_user", SavajCapital_UserRoutes);
app.use("/api/allcount", CountRoutes);
app.use("/api/loan", LoanRoutes);
app.use("/api/loan_type", Loan_Type);
app.use("/api/loan_docs", Loan_Documents);
app.use("/api/setpassword", PasswordRoutes);
app.use("/api/file_upload", FileUplodeRoutes);
app.use("/api/bank_approval", BankApprovalRoutes);
app.use("/api/loan_step", LoanStepRoutes);
app.use("/api/document", AddDocumentsRoutes);
app.use("/api/title", TitleRoutes);
app.use("/api/branch_assign", BranchAssignRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Init MongoDB
initMongo();

module.exports = app;
