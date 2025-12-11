"use client";

import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Job Master", path: "/job-master" },
    { name: "Artwork Log", path: "/artwork-log" },
    { name: "Designer Master", path: "/designer-master" },
    { name: "Artwork Type Master", path: "/artwork-type-master" },
    { name: "System Lookup", path: "/system-lookup" },
    { name: "Unified Report ACS", path: "/unified-report-acs" },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col border-r border-sidebar-border h-screen sticky top-0">
      <div className="text-2xl font-bold mb-6 text-sidebar-primary">ACS Reporting</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center p-2 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground"
                  )
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;