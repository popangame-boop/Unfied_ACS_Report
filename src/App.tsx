import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import JobMaster from "./pages/JobMaster";
import ArtworkLog from "./pages/ArtworkLog";
import DesignerMaster from "./pages/DesignerMaster";
import ArtworkTypeMaster from "./pages/ArtworkTypeMaster";
import LeadSubmission from "./pages/LeadSubmission"; // Import the new LeadSubmission page
import ProjectTypeMaster from "./pages/ProjectTypeMaster"; // Import the new ProjectTypeMaster page
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} /> {/* Index will redirect to /dashboard */}
          <Route path="/lead-submission" element={<LeadSubmission />} /> {/* Public Lead Submission Page */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/job-master" element={<JobMaster />} />
            <Route path="/artwork-log" element={<ArtworkLog />} />
            <Route path="/designer-master" element={<DesignerMaster />} />
            <Route path="/artwork-type-master" element={<ArtworkTypeMaster />} />
            <Route path="/project-type-master" element={<ProjectTypeMaster />} /> {/* New route */}
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;