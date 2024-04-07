// import
import React, { Component } from "react";
import Dashboard from "views/Dashboard/Dashboard.js";
import Tables from "views/Dashboard/Tables.js";
import SavajCapitalBranchTable from "views/Dashboard/SavajCapitalBranchTable";
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

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: Dashboard,
    layout: "/superadmin",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    component: Dashboard,
    layout: "/bank",
  },
  {
    path: "/bank",
    name: "Bank Branch",
    icon: <StatsIcon color="inherit" />,
    component: Tables,
    layout: "/superadmin",
  },
  {
    path: "/savajcapitalbranch",
    name: "Savaj Capital Branch",
    icon: <CreditIcon color="inherit" />,
    component: SavajCapitalBranchTable,
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
        path: "/:bank/signin",
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
    ],
  },
];
export default dashRoutes;
