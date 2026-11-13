import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
// A fresh document always starts at the opening, even after a saved journey.
history.scrollRestoration = "manual";
window.scrollTo(0, 0);
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
