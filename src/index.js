import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx"; // Removed file extension

// This is the ID of the div in your index.html file

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
    <h1> Test h1 </h1>
  </React.StrictMode>
);
