"use client";

import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, FileText, Users, Palette, Settings } from "lucide-react"; // Import Settings icon

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Job Master", path: "/job-master", icon: Briefcase },
    { name: "Artwork Log", path: "/artwork-log", icon: FileText },
    { name: "Designer Master", path: "/designer-master", icon: Users },
    { name: "Artwork Type Master", path: "/artwork-type-master", icon: Palette },
    { name: "System Lookup", path: "/system-lookup", icon: Settings }, // New nav item
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col border-r border-sidebar-border h-screen sticky top-0 shadow-md">
      <div className="text-2xl font-bold mb-8 text-sidebar-primary px-2">ACS Reporting</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
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