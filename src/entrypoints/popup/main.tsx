import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import { initAnalytics, track } from "@/lib/posthog";

void initAnalytics("linkclean").then(() =>
  track("popup_open", { path: "popup" }),
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
