import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MQTTProvider } from "@/mqtt/MQTTProvider";
import { router } from "./router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MQTTProvider>
      <RouterProvider router={router} />
    </MQTTProvider>
  </React.StrictMode>
);