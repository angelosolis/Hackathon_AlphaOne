import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login"; // Import the Login component
import Register from "./pages/Register"; // Import the Register component
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat"; // Import the Conversation component
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import Profile from "./pages/Profile";
import CreateProperty from "./pages/CreateProperty";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id/:slug" element={<PropertyDetail />} />
            <Route path="/properties/:id" element={<Navigate to="/properties" replace />} />
            <Route path="/create-property" element={<CreateProperty />} />
            <Route path="/chat" element={<Chat />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
