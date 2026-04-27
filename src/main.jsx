import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { getTheme, setTheme } from "./utils/storage.js";

// Initialize theme
setTheme(getTheme());

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
