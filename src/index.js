import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/theme"; // Adjust the import path as needed

import AuthLayout from "./layouts/Auth"; // Adjust import paths as needed
import AdminLayout from "./layouts/Superadmin"; // Adjust import paths as needed

// Define an AuthGuard component
const AuthGuard = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  return authToken ? children : <Redirect to="/auth/signin" />;
};

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <HashRouter>
      <Switch>
        <Route path="/auth" component={AuthLayout} />
        <Route
          path="/bank"
          render={() => (
            <AuthGuard>
              <AdminLayout name={"/bank"} />
            </AuthGuard>
          )}
        />
        <Route
          path="/superadmin"
          render={() => (
            <AuthGuard>
              <AdminLayout name={"/superadmin"} />
            </AuthGuard>
          )}
        />
        <Redirect from="/" to="/auth/signin" />
      </Switch>
    </HashRouter>
  </ChakraProvider>,
  document.getElementById("root")
);
