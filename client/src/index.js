import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTopOnRoute from "./components/ScrollToTopOnRoute";
import ReportPage from "./components/ReportPage";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTopOnRoute />
      <Routes>
        <Route path="/">
          <Route path="/" element={<App />} />
          <Route path=":cityId" element={<App />} />
          <Route path="report" element={<ReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
