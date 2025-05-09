
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNutrify } from "@/context/NutrifyContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useNutrify();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    height: user?.height || 0,
    weight: user?.weight || 0,
    goal: user?.goal || 'maintain',
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };
  
  const handleGoalChange = (value: 'lose' | 'maintain' | 'gain') => {
    let calorieGoal = formData.dailyCalorieGoal;
    
    // Adjust calorie goal based on selected goal
    if (value === 'lose' && user?.goal !== 'lose') calorieGoal -= 500;
    if (value === 'gain' && user?.goal !== 'gain') calorieGoal += 500;
    if (value === 'maintain' && user?.goal === 'lose') calorieGoal += 500;
    if (value === 'maintain' && user?.goal === 'gain') calorieGoal -= 500;
    
    setFormData({
      ...formData,
      goal: value,
      dailyCalorieGoal: calorieGoal
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      const updatedUser = {
        ...user,
        name: formData.name,
        height: formData.height,
        weight: formData.weight,
        goal: formData.goal as 'lose' | 'maintain' | 'gain',
        dailyCalorieGoal: formData.dailyCalorieGoal,
      };
      
      setUser(updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
      navigate('/');
    }
  };
  
  const handleReset = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Reload the page to reset the app
    window.location.reload();
  };
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div className="min-h-screen bg-nutrify-light p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Your Profile</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="shadow-md mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                name="name"
                value={formData.name} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input 
                id="height" 
                name="height"
                type="number" 
                value={formData.height || ''} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input 
                id="weight" 
                name="weight"
                type="number" 
                value={formData.weight || ''} 
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Nutrition Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>What is your goal?</Label>
              <RadioGroup 
                value={formData.goal} 
                onValueChange={(value) => handleGoalChange(value as 'lose' | 'maintain' | 'gain')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lose" id="lose" />
                  <Label htmlFor="lose">Lose Weight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintain" id="maintain" />
                  <Label htmlFor="maintain">Maintain Weight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gain" id="gain" />
                  <Label htmlFor="gain">Gain Weight</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
              <Input 
                id="calorieGoal" 
                name="dailyCalorieGoal"
                type="number" 
                value={formData.dailyCalorieGoal} 
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                This is your target daily calorie intake based on your goal.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col space-y-2 mt-6">
          <Button 
            type="submit"
            className="bg-nutrify-teal hover:bg-nutrify-teal/90"
          >
            Save Changes
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-50" 
            onClick={handleReset}
          >
            Reset App Data
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
