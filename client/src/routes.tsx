import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotesPage from "./pages/NotesPage";

const navigation = (isAuthenticated: boolean) => (
  <Routes>
    {isAuthenticated ? (
      <>
        <Route path="/" element={<NotesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    ) : (
      <>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/sign-up" replace />} />
      </>
    )}
  </Routes>
);

export default navigation;
