// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Overview from "./components/Overview";
import ReportPage from "./components/ReportPage";
import FranchiseAnalysis from "./components/FranchiseAnalysis";
import ScrollToTopOnRoute from "./components/ScrollToTopOnRoute";

function App() {
  return (
    <>
      <ScrollToTopOnRoute />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/:cityId" element={<Overview />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/franchise" element={<FranchiseAnalysis />} />
      </Routes>
    </>
  );
}

export default App;
