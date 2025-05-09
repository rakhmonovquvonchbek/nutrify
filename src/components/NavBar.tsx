
import { Button } from "@/components/ui/button";
import { Camera, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around items-center">
      <Button 
        onClick={() => navigate("/camera")}
        className="bg-nutrify-teal hover:bg-nutrify-teal/90 w-1/3 h-12 flex items-center justify-center"
      >
        <Camera className="mr-2" />
        <span>Snap</span>
      </Button>
      
      <Button 
        onClick={() => navigate("/search")}
        variant="outline" 
        className="w-1/3 h-12 flex items-center justify-center"
      >
        <Search className="mr-2" />
        <span>Search</span>
      </Button>
    </div>
  );
};

export default NavBar;
