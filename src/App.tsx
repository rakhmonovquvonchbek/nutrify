
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NutrifyProvider } from "./context/NutrifyContext";
import MainApp from "./pages/MainApp";
import CameraCapture from "./components/CameraCapture";
import FoodSearch from "./components/FoodSearch";
import Profile from "./components/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NutrifyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/camera" element={<CameraCapture />} />
            <Route path="/search" element={<FoodSearch />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NutrifyProvider>
  </QueryClientProvider>
);

export default App;
