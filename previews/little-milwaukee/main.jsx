import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import TrafficCity from "../../src/features/traffic/TrafficCity.jsx";
import "./style.css";
import { registerCityTools } from "./webmcp.js";

function LittleMilwaukee() {
  useEffect(registerCityTools, []);
  return (
    <main className="layout little-milwaukee-page">
      <header className="little-milwaukee-heading">
        <h1>Little Milwaukee</h1>
        <p>Drag to rotate · Pinch to zoom · Two fingers to move</p>
      </header>
      <TrafficCity standalone />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<LittleMilwaukee />);
