
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import Case1 from "./pages/case/Case1";
import NotFound from "./pages/NotFound";
import OTPVerification  from "./pages/2ndstepVerification";
import AdminDashboard from "./pages/AdminDashboard";
import { Features } from "./components/Features";
import { Testimonials } from "./components/Testimonials";
import { Pricing } from "./components/Pricing";
import { Security } from "./components/Security";
import { Roadmap } from "./components/Roadmap";
import { Contact } from "./components/Contact";
import { Privacy } from "./components/Privacy";
import { Terms } from "./components/Terms";
import About from "./components/About";
import ForgotPassword from "./pages/forgotpassword";
import Profile from "./pages/Profile";
import AdminAbout from "./components/AdminAbout";
import { AdminFeatures } from "./components/AdminFeatures";
import AdminProfile from "./pages/AdminProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/case/:caseId" element={<Case1 />} />
          <Route path="/verification" element={<OTPVerification/>}/>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/features" element={<Features />} /> 
          <Route path="/testimonials" element={<Testimonials />} />   
          <Route path="/pricing" element={<Pricing />} /> 
          <Route path="/security" element={<Security />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-about" element={<AdminAbout />} />
          <Route path="/admin-features" element={<AdminFeatures />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          {/* Add more routes as needed */}
          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

