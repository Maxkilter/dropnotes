import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import navigation from "./routes";
import { useAuth } from "./hooks/useAuth";
import { AuthContext } from "./context/AuthContext";

import "./App.css";

const App = () => {
  const { logIn, logOut, userId, token, isReady } = useAuth();
  const isAuthenticated = !!token;

  const routes = navigation(isAuthenticated);

  if (!isReady) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{ logOut, logIn, userId, token, isAuthenticated }}
    >
      <Router>
        <Navbar isAuthenticated={isAuthenticated} />
        {routes}
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
