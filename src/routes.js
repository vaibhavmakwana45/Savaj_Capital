// import
import React, { Component } from "react";
import Dashboard from "views/Dashboard/Dashboard.js";
import BankDashboard from "banksdashboard/BankDashboard";
import UserDashboard from "userdashboard/UserDashboard";
import SavajCapitalBranchDashboard from "savajcapitaldashboard/SavajCapitalDashboard";
import BankTable from "addbank/BankTable";
import SavajCapitalBranchTable from "addsavajcapitalbranch/SavajCapitalBranchTable";
import EditSavajCapitalBranch from "addsavajcapitalbranch/EditSavajCapitalBranch";
import UserTable from "adduser/UserTable";
import Profile from "views/Dashboard/Profile.js";
import SignIn from "views/Pages/SignIn.js";
import SignUp from "views/Pages/SignUp.js";
import AddBank from "addbank/AddBank";
import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
  PersonIcon,
  DocumentIcon,
  RocketIcon,
  SupportIcon,
} from "components/Icons/Icons";
import AddSavajCapitalBranch from "addsavajcapitalbranch/AddSavajCapitalBranch";
import AddSavajCapitalUser from "addsavajcapitalbranch/AddSavajUser";
import AddUser from "adduser/AddUser";
import SavajUsers from "addsavajcapitalbranch/SavajUsers";
import SavajUsersRole from "addsavajcapitalbranch/SavajUsersRole";
import AddBankUser from "addbank/AddBankUser";
import BankUsers from "addbank/BankUsers";
import LoanTypes from "loan/LoanTypes";
import AddLoanType from "loan/AddLoanType";
import LoanSubTypes from "loan/LoanSubTypes";
import AddLoanDocuments from "loan/AddLoanDocuments";
import NewPassword from "views/Pages/NewPassword";
import LoanDocument from "loan/LoanDocument";
import Files from "files/Files";
import AddFiles from "files/AddFiles";
import Document from "Document/Document";
import ViewFile from "files/ViewFile";
import EditFile from "files/EditFile";

var dashRoutes = [
  //superadmin
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: Dashboard,
    layout: "/superadmin",
    hideInSResponsive: true,
  },
  {
    path: "/bank",
    name: "Bank Branch",
    icon: <CreditIcon color="inherit" />,
    component: BankTable,
    layout: "/superadmin",
    hideInSResponsive: true,
  },
  {
    path: "/savajcapitalbranch",
    name: "SC Branch",
    icon: <StatsIcon color="inherit" />,
    component: SavajCapitalBranchTable,
    layout: "/superadmin",
    hideInSResponsive: true,
  },
  {
    path: "/savajusers",
    name: "Savaj Capital Users",
    icon: <StatsIcon color="inherit" />,
    component: SavajUsers,
    hideInSidebar: true,
    layout: "/superadmin",
  },
  {
    path: "/savajuserroles",
    name: "Savaj Capital Users",
    icon: <StatsIcon color="inherit" />,
    component: SavajUsersRole,
    hideInSidebar: true,
    layout: "/superadmin",
  },
  {
    path: "/alluser",
    name: "All User",
    icon: <PersonIcon color="inherit" />,
    component: UserTable,
    layout: "/superadmin",
    hideInSResponsive: true,
  },
  {
    path: "/addbank",
    name: "Add Bank",
    icon: <CreditIcon color="inherit" />,
    component: AddBank,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/addbankuser",
    name: "Add Bank",
    icon: <CreditIcon color="inherit" />,
    component: AddBankUser,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/bankusers",
    name: "Banks Users",
    icon: <CreditIcon color="inherit" />,
    component: BankUsers,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/documents",
    name: "Document",
    icon: <CreditIcon color="inherit" />,
    component: Document,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/loan",
    name: "Loan",
    icon: <CreditIcon color="inherit" />,
    component: LoanTypes,
    layout: "/superadmin",
    hideInSResponsive: true,
  },
  // {
  //   path: "/file",
  //   name: "File Upload",
  //   icon: <CreditIcon color="inherit" />,
  //   component: FileUplode,
  //   layout: "/superadmin",
  //   hideInSResponsive: true
  // },
  {
    path: "/loantype",
    name: "Loan",
    icon: <CreditIcon color="inherit" />,
    component: LoanSubTypes,
    hideInSidebar: true,
    layout: "/superadmin",
  },
  {
    path: "/loandocument",
    name: "Loan",
    icon: <CreditIcon color="inherit" />,
    component: LoanDocument,
    hideInSidebar: true,
    layout: "/superadmin",
  },
  {
    path: "/addsavajcapitalbranch",
    name: "Add Savaj Capital Branch",
    icon: <CreditIcon color="inherit" />,
    component: AddSavajCapitalBranch,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/addsavajcapitaluser",
    name: "Add Savaj Capital User",
    icon: <CreditIcon color="inherit" />,
    component: AddSavajCapitalUser,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/adduser",
    name: "Add User",
    icon: <CreditIcon color="inherit" />,
    component: AddUser,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/addloantype",
    name: "Add User",
    icon: <CreditIcon color="inherit" />,
    component: AddLoanType,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/addloandocs",
    name: "Add User",
    icon: <CreditIcon color="inherit" />,
    component: AddLoanDocuments,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/edituser/:user_id",
    name: "Edit User",
    icon: <CreditIcon color="inherit" />,
    component: AddUser,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/editsavajcapitalbranch/:id",
    name: "Add Savaj Capital Branch",
    icon: <CreditIcon color="inherit" />,
    component: EditSavajCapitalBranch,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/filetable",
    name: "Files",
    icon: <DocumentIcon color="inherit" />,
    component: Files,
    layout: "/superadmin",
  },
  {
    path: "/addfile",
    name: "Files",
    icon: <DocumentIcon color="inherit" />,
    component: AddFiles,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/viewfile",
    name: "Files",
    icon: <DocumentIcon color="inherit" />,
    component: ViewFile,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  {
    path: "/editfile",
    name: "Files",
    icon: <DocumentIcon color="inherit" />,
    component: EditFile,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  //auth
  {
    name: "ACCOUNT PAGES",
    category: "account",
    state: "pageCollapse",
    views: [
      {
        path: "/profile",
        name: "Profile",
        icon: <PersonIcon color="inherit" />,
        secondaryNavbar: true,
        component: Profile,
        layout: "/auth",
      },
      {
        path: "/signin",
        name: "Sign In",
        icon: <DocumentIcon color="inherit" />,
        component: SignIn,
        layout: "/auth",
      },
      {
        path: "/signup",
        name: "Sign Up",
        icon: <RocketIcon color="inherit" />,
        component: SignUp,
        layout: "/auth",
      },
      {
        path: "/setpassword",
        name: "New Password",
        icon: <RocketIcon color="inherit" />,
        component: NewPassword,
        layout: "/auth",
      },
    ],
  },
  //bankuser
  {
    path: "/dashboard",
    name: "Bank Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: BankDashboard,
    layout: "/bankuser",
  },
  //surajcapitaluser
  {
    path: "/dashboard",
    name: "SC User Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: SavajCapitalBranchDashboard,
    layout: "/savajcapitaluser",
  },
  //user
  {
    path: "/dashboard",
    name: "User Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: UserDashboard,
    layout: "/user",
  },
];
export default dashRoutes;
