import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UnifiedReportACS from "./pages/UnifiedReportACS";
import Dashboard from "./pages/Dashboard"; // Import halaman baru
import JobMaster from "./pages/JobMaster"; // Import halaman baru
import ArtworkLog from "./pages/ArtworkLog"; // Import halaman baru
import DesignerMaster from "./pages/DesignerMaster"; // Import halaman baru
import ArtworkTypeMaster from "./pages/ArtworkTypeMaster"; // Import halaman baru
import SystemLookup from "./pages/SystemLookup"; // Import halaman baru
import Layout from "./components/Layout"; // Import komponen Layout

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} /> {/* Index will redirect to /dashboard */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/job-master" element={<JobMaster />} />
            <Route path="/artwork-log" element={<ArtworkLog />} />
            <Route path="/designer-master" element={<DesignerMaster />} />
            <Route path="/artwork-type-master" element={<ArtworkTypeMaster />} />
            <Route path="/system-lookup" element={<SystemLookup />} />
            <Route path="/unified-report-acs" element={<UnifiedReportACS />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;