import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Notification } from "./components/Notification";
import { StoreContext } from "./appStore";
import { NotesPage } from "./pages/NotesPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";

import "./App.css";

export const App = () => {
  const {
    notification: { isOpen, message, severity },
    setNotification,
  } = useContext(StoreContext);

  return (
    <>
      <Notification
        isOpen={isOpen}
        setIsOpen={setNotification}
        message={message}
        severity={severity}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<NotesPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/sign-up" replace />} />
      </Routes>
    </>
  );
};
