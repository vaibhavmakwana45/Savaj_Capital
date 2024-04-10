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
import NewPassword from "views/Pages/NewPassword";

var dashRoutes = [
  //superadmin
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: Dashboard,
    layout: "/superadmin",
  },
  {
    path: "/bank",
    name: "Bank Branch",
    icon: <CreditIcon color="inherit" />,
    component: BankTable,
    layout: "/superadmin",
  },
  {
    path: "/savajcapitalbranch",
    name: "Savaj Capital Branch",
    icon: <StatsIcon color="inherit" />,
    component: SavajCapitalBranchTable,
    layout: "/superadmin",
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
