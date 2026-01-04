"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("Q3");

  const value = useMemo(
    () => ({
      stations,
      setStations,
      selectedId,
      setSelectedId,
      year,
      setYear,
      quarter,
      setQuarter,
    }),
    [stations, selectedId, year, quarter]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
