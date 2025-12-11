import React from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to the dashboard as the default entry point
  return <Navigate to="/dashboard" replace />;
};

export default Index;