import React, { useContext } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import navigation from "./routes";
import Notification from "./components/Notification";
import { StoreContext } from "./appStore";
import { LoaderTypes } from "./types";

import "./App.css";

const App = () => {
  const { token, isReady, notification, setNotification } = useContext(
    StoreContext
  );
  const { isOpen, message, severity } = notification;
  const isAuthenticated = !!token;
  const routes = navigation(isAuthenticated);

  if (!isReady) {
    return <Loader type={LoaderTypes.darken} />;
  }

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} />
      {routes}
      <Notification
        isOpen={isOpen}
        setIsOpen={setNotification}
        message={message}
        severity={severity}
      />
    </Router>
  );
};

export default App;
