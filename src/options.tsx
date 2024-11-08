import App from "./OptionsApp";
import React from "react";
import ReactDOM from "react-dom/client";
import "./options.scss";

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw Error("Root element is not found!");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
