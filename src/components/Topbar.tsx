"use client";

import React from "react";
import { SearchIcon, BellIcon, UserCircleIcon, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const Topbar = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(`Gagal keluar: ${error.message}`);
    }
    // SessionContextProvider will handle the redirect on successful logout
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card px-6 py-4 shadow-sm flex items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-md bg-background pl-9 pr-4 py-2 text-sm focus-visible:ring-vibrant-purple"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <BellIcon className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
          <AvatarFallback>
            <UserCircleIcon className="h-9 w-9 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;