import React from "react";
import { createRoot } from "react-dom/client";
import TrafficCity from "./features/traffic/TrafficCity.jsx";
import "./standalone.css";
createRoot(document.getElementById("root")).render(<TrafficCity standalone />);
