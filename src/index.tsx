import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename="/querier">
      <Routes>
        <Route path={"/*"} element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);