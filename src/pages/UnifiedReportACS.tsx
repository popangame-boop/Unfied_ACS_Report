"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UnifiedReportACS = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="text-center bg-card p-8 rounded-xl shadow-subtle">
        <CardHeader>
          <CardTitle className="text-4xl font-bold mb-4 text-foreground">
            Unified Report ACS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-muted-foreground mb-6">
            Selamat datang di halaman Unified Report ACS Anda.
          </p>
          <Link to="/">
            <Button variant="outline" className="text-vibrant-purple border-vibrant-purple hover:bg-vibrant-purple/10 dark:hover:bg-vibrant-purple/20 rounded-md shadow-sm">
              Kembali ke Beranda
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedReportACS;