import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignupForm from "@/pages/auth/signup/SignupForm";
import VerifyEmail from "@/pages/auth/signup/VerifyEmail";
import ProfileSetup from "@/pages/auth/signup/ProfileSetup";
import SignupSuccess from "@/pages/auth/signup/SignupSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Auth - Signup */}
          <Route path="/auth/signup" element={<SignupForm />} />
          <Route path="/auth/signup/verify" element={<VerifyEmail />} />
          <Route path="/auth/signup/profile" element={<ProfileSetup />} />
          <Route path="/auth/signup/success" element={<SignupSuccess />} />

          
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
