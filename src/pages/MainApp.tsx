
import { useNutrify } from "@/context/NutrifyContext";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MainApp = () => {
  const { isOnboarded } = useNutrify();
  const navigate = useNavigate();
  
  return (
    <>
      {isOnboarded ? (
        <div className="relative">
          <Dashboard />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 rounded-full"
            onClick={() => navigate('/profile')}
          >
            <UserCircle className="h-6 w-6 text-nutrify-teal" />
          </Button>
        </div>
      ) : (
        <Onboarding />
      )}
    </>
  );
};

export default MainApp;
