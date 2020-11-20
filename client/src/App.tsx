//@ts-nocheck
import React, { useContext } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import navigation from "./routes";
import Notification from "./components/Notification";
import { StoreContext } from "./appStore";

import "./App.css";

const App = () => {
  const { token, isReady, notification, setNotification } = useContext(
    StoreContext
  );
  const isAuthenticated = !!token;

  const routes = navigation(isAuthenticated);

  if (!isReady) {
    return <Loader />;
  }

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} />
      {routes}
      <Notification
        isOpen={notification.isOpen}
        setIsOpen={setNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Router>
  );
};

export default App;
