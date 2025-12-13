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
import LeadSubmission from "./pages/LeadSubmission";
import ProjectTypeMaster from "./pages/ProjectTypeMaster";
import Layout from "./components/Layout";
import Login from "./pages/Login"; // Import the new Login page
import { SessionContextProvider } from "./integrations/supabase/auth"; // Import SessionContextProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap with SessionContextProvider */}
          <Routes>
            <Route path="/login" element={<Login />} /> {/* Login page */}
            <Route path="/lead-submission" element={<LeadSubmission />} /> {/* Public Lead Submission Page */}
            <Route path="/" element={<Index />} /> {/* Index will redirect to /dashboard if logged in, or /login if not */}
            <Route element={<Layout />}> {/* Protected routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/job-master" element={<JobMaster />} />
              <Route path="/artwork-log" element={<ArtworkLog />} />
              <Route path="/designer-master" element={<DesignerMaster />} />
              <Route path="/artwork-type-master" element={<ArtworkTypeMaster />} />
              <Route path="/project-type-master" element={<ProjectTypeMaster />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;