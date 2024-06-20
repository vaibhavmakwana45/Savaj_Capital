// import
import React from "react";
import Dashboard from "views/Dashboard/Dashboard.js";
import BankDashboard from "banksdashboard/BankDashboard";
import UserDashboard from "userdashboard/UserDashboard";
import SavajCapitalBranchDashboard from "savajcapitaldashboard/SavajCapitalDashboard";
import UserFile from "savajcapitaldashboard/ScBranchFiles/UserFile";
import adduserfile from "savajcapitaldashboard/ScBranchFiles/CreateUserFile";
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
import EditLoanDocuments from "loan/EditLoanDocuments";
import NewPassword from "views/Pages/NewPassword";
import Files from "files/Files";
import AddFiles from "files/AddFiles";
import Document from "loan/Document";
import ViewFile from "files/ViewFile";
import EditFile from "files/EditFile";
import BankAssignFile from "addbank/BankAssignFile";
import AllFiles from "banksdashboard/AllBankFiles/AllBankFiles";
import BankFileDetailPage from "banksdashboard/AllBankFiles/BankFileDetailPage";
import EditFileScBranch from "savajcapitaldashboard/ScBranchFiles/EditFileScBranch";
import DetailScFilePage from "savajcapitaldashboard/ScBranchFiles/DetailScFilePage";
import AssignBank from "savajcapitaldashboard/AssignBank/AssignBank";
import AssignFile from "savajcapitaldashboard/AssignBank/AssignFile";
import AddAllDocuments from "loan/AddAllDocuments";
import AllStep from "Allstep/AllStep";
import AssignedSavajUsers from "addsavajcapitalbranch/AssignedSavajUsers";
import AssignedBankUsers from "addbank/AssignedBankUsers";
import Title from "./loan/Title";
import SavajAssignFile from "addsavajcapitalbranch/SavajAssignFile";
import CustomerFile from "userdashboard/CustomerFiles/CustomerFile";
import CreateCustomerFile from "userdashboard/CustomerFiles/CreateCustomerFile";
import EditFileCustomer from "userdashboard/CustomerFiles/EditFileCustomer";
import DetailCustomerFilePage from "userdashboard/CustomerFiles/DetailCustomerFilePage";
import AddCustomer from "savajcapitaldashboard/AddCustomer/AddCustomer";
import Customer from "savajcapitaldashboard/AddCustomer/Customer";
import LoanStatus from "loan/LoanStatus";

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
    path: "/alluser",
    name: "Customers",
    icon: <PersonIcon color="inherit" />,
    component: UserTable,
    layout: "/superadmin",
    parent: "superadmin",
    key: "alluser",
    hideInSResponsive: true,
  },
  //files
  {
    path: "/filetable",
    name: "Files",
    icon: <DocumentIcon color="inherit" />,
    component: Files,
    layout: "/superadmin",
    parent: "superadmin",
    key: "filetable",
    hideInSResponsive: true,
  },
  {
    path: "/addfile",
    name: "Add Files",
    icon: <DocumentIcon color="inherit" />,
    component: AddFiles,
    layout: "/superadmin",
    parent: "filetable",
    key: "addfile",
    hideInSidebar: true,
  },
  {
    path: "/viewfile",
    name: "View Files",
    icon: <DocumentIcon color="inherit" />,
    component: ViewFile,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "filetable",
    key: "viewfile",
  },
  {
    path: "/editfile",
    name: "Edit Files",
    icon: <DocumentIcon color="inherit" />,
    component: EditFile,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "filetable",
    key: "editfile",
  },
  //users

  {
    path: "/adduser",
    name: "Add Customer",
    icon: <CreditIcon color="inherit" />,
    component: AddUser,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "alluser",
    key: "adduser",
  },
  {
    path: "/edituser",
    name: "Edit Customer",
    icon: <CreditIcon color="inherit" />,
    component: AddUser,
    parent: "alluser",
    key: "edituser",
    layout: "/superadmin",
    hideInSidebar: true,
  },
  //loan
  {
    path: "/loan",
    name: "Loan",
    icon: <CreditIcon color="inherit" />,
    component: LoanTypes,
    layout: "/superadmin",
    hideInSResponsive: true,
    parent: "superadmin",
    key: "loan",
    isDropdown: true,
    childern: [
      {
        layout: "/superadmin",
        path: "/title",
        name: "Add Title",
      },
      {
        path: "/addalldocument",
        name: "Documents",
        layout: "/superadmin",
      },
      {
        path: "/addalldstep",
        name: "Loan Step",
        layout: "/superadmin",
      },
      {
        layout: "/superadmin",
        path: "/addloanstatus",
        name: "Loan Status",
      },
      // {
      //   path: "/addloantype",
      //   name: "Add Loan",
      //   layout: "/superadmin",
      // },
      // {
      //   path: "/addloantype",
      //   name: "Add Document With Title",
      //   layout: "/superadmin",
      // },
    ],
  },
  {
    path: "/addloantype",
    name: "Add Loan",
    icon: <CreditIcon color="inherit" />,
    component: AddLoanType,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "loan",
    key: "addloantype",
  },
  {
    path: "/addloandocs",
    name: "Add Document",
    icon: <CreditIcon color="inherit" />,
    component: AddLoanDocuments,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "loan",
    key: "addloandocs",
  },
  {
    path: "/editloandocs",
    name: "Edit Document",
    icon: <CreditIcon color="inherit" />,
    component: EditLoanDocuments,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "loan",
    key: "addloandocs",
  },
  {
    path: "/documents",
    name: "Document",
    icon: <CreditIcon color="inherit" />,
    component: Document,
    layout: "/superadmin",
    parent: "loan",
    key: "documents",
    hideInSidebar: true,
  },
  {
    path: "/documents",
    name: "Document for Loan Type",
    icon: <CreditIcon color="inherit" />,
    component: Document,
    layout: "/superadmin",
    parent: "addloantype",
    key: "documentsLoanType",
    hideInSidebar: true,
  },
  {
    path: "/loantype",
    name: "Loan Type",
    icon: <CreditIcon color="inherit" />,
    component: LoanSubTypes,
    hideInSidebar: true,
    layout: "/superadmin",
    parent: "loan",
    key: "loantype",
  },

  //sc branch
  {
    path: "/savajcapitalbranch",
    name: "SC Branch",
    icon: <StatsIcon color="inherit" />,
    component: SavajCapitalBranchTable,
    layout: "/superadmin",
    hideInSResponsive: true,
    parent: "superadmin",
    key: "savajcapitalbranch",
    isDropdown: true,
    childern: [
      {
        layout: "/superadmin",
        path: "/addsavajcapitalbranch",
        name: "Add Branch",
      },
      {
        layout: "/superadmin",
        path: "/addsavajcapitaluser",
        name: "Add User",
      },
      {
        layout: "/superadmin",
        path: "/savajuserroles",
        name: "Add Roles",
      },

      // {
      //   layout: "/superadmin",
      //   path: "/branch-assigned-file",
      //   name: "Assigned File",
      // },
    ],
  },
  {
    path: "/addsavajcapitalbranch",
    name: "Add Savaj Capital Branch",
    icon: <CreditIcon color="inherit" />,
    component: AddSavajCapitalBranch,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "savajcapitalbranch",
    key: "addsavajcapitalbranch",
  },
  {
    path: "/addsavajcapitaluser",
    name: "Add Savaj Capital User",
    icon: <CreditIcon color="inherit" />,
    component: AddSavajCapitalUser,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "savajcapitalbranch",
    key: "addsavajcapitaluser",
  },
  {
    path: "/savajuserroles",
    name: "Add Savaj Capital Roles",
    icon: <StatsIcon color="inherit" />,
    component: SavajUsersRole,
    hideInSidebar: true,
    layout: "/superadmin",
    parent: "savajcapitalbranch",
    key: "savajuserroles",
  },
  {
    path: "/savajusers",
    name: "Savaj Capital Users",
    icon: <StatsIcon color="inherit" />,
    component: SavajUsers,
    hideInSidebar: true,
    layout: "/superadmin",
    parent: "savajcapitalbranch",
    key: "savajusers",
  },
  {
    path: "/editsavajcapitalbranch/:id",
    name: "Edit Savaj Capital Branch",
    icon: <CreditIcon color="inherit" />,
    component: EditSavajCapitalBranch,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "savajcapitalbranch",
    key: "editsavajcapitalbranch",
  },
  {
    path: "/assigned-file",
    name: "Assigned File (Savaj User)",
    icon: <CreditIcon color="inherit" />,
    component: AssignedSavajUsers,
    hideInSidebar: true,
    layout: "/superadmin",
    parent: "savajusers",
    key: "savajcapitalbranch",
  },
  {
    path: "/branch-assigned-file",
    name: "Assigned File (Savaj User)",
    icon: <CreditIcon color="inherit" />,
    component: SavajAssignFile,
    hideInSidebar: true,
    layout: "/superadmin",
    parent: "savajcapitalbranch",
    key: "branch-assigned-file",
  },
  //bank
  {
    path: "/bank",
    name: "Bank Branch",
    icon: <CreditIcon color="inherit" />,
    component: BankTable,
    layout: "/superadmin",
    hideInSResponsive: true,
    parent: "superadmin",
    key: "bank",
    isDropdown: true,
    childern: [
      {
        layout: "/superadmin",
        path: "/addbank",
        name: "Add Bank",
      },
      {
        path: "/addbankuser",
        name: "Add Bank User",
        layout: "/superadmin",
      },
      // {
      //   path: "/bankassignfile",
      //   name: "Assign File",
      //   layout: "/superadmin",
      // },
    ],
  },
  {
    path: "/addbank",
    name: "Add Bank",
    icon: <CreditIcon color="inherit" />,
    component: AddBank,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "bank",
    key: "addbank",
  },
  {
    path: "/addbankuser",
    name: "Add Bank",
    icon: <CreditIcon color="inherit" />,
    component: AddBankUser,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "bank",
    key: "addbankuser",
  },
  {
    path: "/bankusers",
    name: "Banks Users",
    icon: <CreditIcon color="inherit" />,
    component: BankUsers,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "bank",
    key: "bankusers",
  },
  {
    path: "/bankassignfile",
    name: "Bank Assign File",
    icon: <CreditIcon color="inherit" />,
    component: BankAssignFile,
    layout: "/superadmin",
    hideInSidebar: true,
    parent: "bank",
    key: "bankassignfile",
  },
  {
    path: "/bank-assigned-file",
    name: "Assigned File (Bank User)",
    icon: <CreditIcon color="inherit" />,
    component: AssignedBankUsers,
    hideInSidebar: true,
    layout: "/superadmin",
    parent: "bankusers",
    key: "bank-assigned-file",
  },
  //document
  {
    path: "/addalldocument",
    name: "Documents",
    icon: <DocumentIcon color="inherit" />,
    component: AddAllDocuments,
    layout: "/superadmin",
    hideInSidebar: true,
  },
  //document
  {
    path: "/addalldstep",
    name: "Loan Step",
    icon: <CreditIcon color="inherit" />,
    component: AllStep,
    layout: "/superadmin",
    hideInSidebar: true,
    // hideInSResponsive: true,
  },
  {
    path: "/addloanstatus",
    name: "Loan Status",
    icon: <CreditIcon color="inherit" />,
    component: LoanStatus,
    layout: "/superadmin",
    hideInSidebar: true,
    // hideInSResponsive: true,
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
    hideInBResponsivrUser: true,
    parent: "bankuser",
    key: "dashboard",
  },
  {
    path: "/allfiles",
    name: "All Files",
    icon: <DocumentIcon color="inherit" />,
    component: AllFiles,
    layout: "/bankuser",
    hideInBResponsivrUser: true,
    parent: "bankuser",
    key: "allfiles",
  },
  {
    path: "/viewbankfile",
    name: "View Bank Files",
    icon: <DocumentIcon color="inherit" />,
    component: BankFileDetailPage,
    layout: "/bankuser",
    hideInSidebar: true,
    // hideInBResponsivrUser: true,
    parent: "bankuser",
    key: "viewbankfile",
  },
  //surajcapitaluser
  {
    path: "/dashboard",
    name: "SC User Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: SavajCapitalBranchDashboard,
    layout: "/savajcapitaluser",
    hideInSResponsivrUser: true,
  },
  {
    path: "/customer",
    name: "Customer",
    icon: <PersonIcon color="inherit" />,
    component: Customer,
    layout: "/savajcapitaluser",
    hideInSResponsivrUser: true,
  },
  {
    path: "/addcustomer",
    name: "Add Customer",
    component: AddCustomer,
    layout: "/savajcapitaluser",
    hideInSidebar: true,
    parent: "customer",
    key: "addcustomer",
  },
  {
    path: "/userfile",
    name: "User File",
    icon: <PersonIcon color="inherit" />,
    component: UserFile,
    layout: "/savajcapitaluser",
    hideInSResponsivrUser: true,
  },
  {
    path: "/adduserfile",
    name: "Add user file",
    component: adduserfile,
    layout: "/savajcapitaluser",
    hideInSidebar: true,
    parent: "adduserfile",
    key: "adduserfile",
  },
  {
    path: "/edituserfile",
    name: "Edit user file",
    component: EditFileScBranch,
    layout: "/savajcapitaluser",
    hideInSidebar: true,
    parent: "adduserfile",
    key: "edituserfile",
  },
  {
    path: "/viewuserfile",
    name: "View user file",
    component: DetailScFilePage,
    layout: "/savajcapitaluser",
    hideInSidebar: true,
    parent: "adduserfile",
    key: "viewuserfile",
  },
  // {
  //   path: "/assignbank",
  //   name: "Assign Bank",
  //   icon: <CreditIcon color="inherit" />,
  //   component: AssignBank,
  //   layout: "/savajcapitaluser",
  //   hideInSResponsivrUser: true,
  //   parent: "savajcapitaluser",
  //   key: "assignbank",
  // },
  {
    path: "/assignfile",
    name: "Assign File",
    icon: <CreditIcon color="inherit" />,
    component: AssignFile,
    layout: "/savajcapitaluser",
    hideInSidebar: true,
    parent: "assignbank",
    key: "assignfile",
  },
  //user
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: UserDashboard,
    hideInCustomer: true,
    layout: "/user",
  },
  {
    path: "/userfile",
    name: "User File",
    icon: <PersonIcon color="inherit" />,
    component: CustomerFile,
    layout: "/user",
    hideInCustomer: false,
  },
  {
    path: "/adduserfile",
    name: "Add user file",
    component: CreateCustomerFile,
    layout: "/user",
    hideInSidebar: true,
    parent: "adduserfile",
    key: "adduserfile",
  },
  {
    path: "/edituserfile",
    name: "Edit user file",
    component: EditFileCustomer,
    layout: "/user",
    hideInSidebar: true,
    parent: "adduserfile",
    key: "edituserfile",
  },
  {
    path: "/viewuserfile",
    name: "View user file",
    component: DetailCustomerFilePage,
    layout: "/user",
    hideInSidebar: true,
    parent: "adduserfile",
    key: "viewuserfile",
  },
  // Title
  {
    path: "/title",
    name: "Title",
    icon: <DocumentIcon color="inherit" />,
    component: Title,
    layout: "/superadmin",
    hideInSidebar: true,
  },
];
export default dashRoutes;
