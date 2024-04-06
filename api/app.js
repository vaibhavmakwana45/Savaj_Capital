require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const initMongo = require('./config.js/mongo');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const SuperAdminSignupRouter = require('./routes/SuperAdminSignupApi');
const AddAdminRouter = require('./routes/AddAdmin');
const AddProjectRouter = require('./routes/AddProject');
const AddUserRouter = require('./routes/AddUser');
const AddReportingFormRouter = require('./routes/AddReportingForm');
const AddTaskRouter = require('./routes/AddTask');
const CountRouter = require('./routes/Count');
const NotificationRouter = require('./routes/Notification');
const AdminProjectRouter = require('./routes/AdminProject');
const AdminNotificationRouter = require('./routes/AdminNotification');
const BankRouter = require('./routes/AddBanksRoutes');
const SavajCapitalBranchRoutes = require('./routes/AddSavajCapitalBranchRoutes');

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/superadminsignup', SuperAdminSignupRouter);
app.use('/api/addadmins', AddAdminRouter);
app.use('/api/addprojects', AddProjectRouter);
app.use('/api/addusers', AddUserRouter);
app.use('/api/addreportingfrom', AddReportingFormRouter);
app.use('/api/addtasks', AddTaskRouter);
app.use('/api/counts', CountRouter);
app.use('/api/notification', NotificationRouter);
app.use('/api/adminprojects', AdminProjectRouter);
app.use('/api/adminnotification', AdminNotificationRouter);
app.use('/api/addbankuser', BankRouter);
app.use('/api/addsavajbapitalbranch', SavajCapitalBranchRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Init MongoDB
initMongo();

module.exports = app;
