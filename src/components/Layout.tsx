"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar"; // Import Topbar

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1"> {/* Wrapper for Topbar and main content */}
        <Topbar />
        <main className="flex-1 p-6"> {/* Added padding to main content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;