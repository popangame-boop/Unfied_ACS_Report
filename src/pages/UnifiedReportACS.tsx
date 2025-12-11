"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UnifiedReportACS = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Unified Report ACS
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
          Selamat datang di halaman Unified Report ACS Anda.
        </p>
        <Link to="/">
          <Button variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UnifiedReportACS;