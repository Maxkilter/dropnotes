import React from "react";
import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import { StoreProvider } from "./appStore";
import ReactGA from "react-ga4";

import "./index.css";

ReactGA.initialize("G-M87VKY5NXM");

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <StoreProvider>
    <App />
  </StoreProvider>
);

const SendAnalytics = () => {
  ReactGA.send({
    hitType: "pageview",
    page: window.location.pathname,
  });
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(SendAnalytics);
