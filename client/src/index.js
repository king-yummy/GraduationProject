import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReportPage from "./components/ReportPage";
import FranchiseAnalysis from "./components/FranchiseAnalysis";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="/" element={<App />} />
          <Route path=":cityId" element={<App />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="franchise" element={<FranchiseAnalysis/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
