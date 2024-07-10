import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/theme";
import AuthLayout from "./layouts/Auth";
import AdminLayout from "./layouts/Superadmin";
import ViewFileLink from "files/ViewFileLink";

const AuthGuard = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  return authToken ? children : <Redirect to="/auth/signin" />;
};

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <Router>
      <Switch>
        <Route path="/auth" component={AuthLayout} />
        <Route
          path="/bankuser"
          render={() => (
            <AuthGuard>
              <AdminLayout name={"/bankuser"} />
            </AuthGuard>
          )}
        />
        <Route
          path="/savajcapitaluser"
          render={() => (
            <AuthGuard>
              <AdminLayout name={"/savajcapitaluser"} />
            </AuthGuard>
          )}
        />
        <Route
          path="/user"
          render={() => (
            <AuthGuard>
              <AdminLayout name={"/user"} />
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
        <Route path="/viewfile" component={ViewFileLink} />
        <Redirect from="/" to="/auth/signin" />
      </Switch>
    </Router>
  </ChakraProvider>,
  document.getElementById("root")
);
