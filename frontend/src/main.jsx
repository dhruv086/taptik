import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./App.css"; // Import Tailwind CSS
import VideoCallProvider from "./components/VideoCallProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <VideoCallProvider>
        <App />
      </VideoCallProvider>
    </BrowserRouter>
  </React.StrictMode>
);