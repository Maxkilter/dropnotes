import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotesPage from "./pages/NotesPage";

const navigation = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return (
      <Switch>
        <Route path="/notes">
          <NotesPage />
        </Route>
        <Route path="/note/:id">{/*<DetailPage />*/}</Route>
        <Redirect to="/notes" />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/sign-in" exact>
        <SignInPage />
      </Route>
      <Route path="/sign-up" exact>
        <SignUpPage />
      </Route>
      <Redirect to="/sign-in" />
    </Switch>
  );
};

export default navigation;
