import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./themes/themes.css";
import "./styles/base.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);