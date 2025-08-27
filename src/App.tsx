import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignupForm from "./pages/auth/signup/SignupForm";
import RequestEmailVerification from "./pages/auth/verification/RequestEmailVerification";
import ProfileSetup from "./pages/auth/signup/ProfileSetup";
import SignupSuccess from "./pages/auth/signup/SignupSuccess";
import SigninForm from "./pages/auth/signin/SigninForm";
import RequestReset from "./pages/auth/password/RequestReset";
import CheckInbox from "./pages/auth/password/CheckInbox";
import NewPassword from "./pages/auth/password/NewPassword";
import ResetSuccess from "./pages/auth/password/ResetSuccess";
import ProcessEmailVerification from "./pages/auth/verification/ProcessEmailVerification";
import AuthRedirect from "./components/auth/AuthRedirect";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Auth - Signup */}
          <Route path="/auth/signup" element={<AuthRedirect><SignupForm /></AuthRedirect>} />
          <Route path="/auth/signup/verify" element={<AuthRedirect><RequestEmailVerification /></AuthRedirect>} />
          <Route path="/auth/signup/profile" element={<AuthRedirect><ProfileSetup /></AuthRedirect>} />
          <Route path="/auth/signup/success" element={<AuthRedirect><SignupSuccess /></AuthRedirect>} />

          {/* Auth - Signin */}
          <Route path="/auth/signin" element={<AuthRedirect><SigninForm /></AuthRedirect>} />

          <Route path="/auth/verify-email" element={<AuthRedirect><ProcessEmailVerification /></AuthRedirect>} />
          
          {/* Auth - Password Reset */}
          <Route path="/auth/password/forgot" element={<RequestReset />} />
          <Route path="/auth/password/check-inbox" element={<CheckInbox />} />
          <Route path="/auth/password/new" element={<NewPassword />} />
          <Route path="/auth/password/success" element={<ResetSuccess />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
