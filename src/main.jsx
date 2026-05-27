import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CompanyProvider } from "./context/CompanyContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CompanyProvider>
      <App />
    </CompanyProvider>
  </AuthProvider>
);
