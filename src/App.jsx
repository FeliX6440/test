import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import { useUser, UserProvider } from "./components/UserContext";
import { AuthenticatedRoute } from "./components/AuthenticatedRoute";
import Home from "./pages/Home";
import "./index.css";
import MainDash from "./pages/MainDash";
import Answers from "./pages/Answers";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <AuthenticatedRoute>
                <MainDash />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/answers/:formId"
            element={
              <AuthenticatedRoute>
                <Answers />
              </AuthenticatedRoute>
            }
          />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
