
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useNutrify } from '@/context/NutrifyContext';
import { UserProfile } from '@/types/nutrify';
import { v4 as uuidv4 } from 'uuid';

const Onboarding = () => {
  const { setUser, setOnboarded } = useNutrify();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    height: undefined,
    weight: undefined,
    goal: 'maintain',
    dietaryPreferences: [],
    dailyCalorieGoal: 2000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setProfile({
      ...profile,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleGoalChange = (value: 'lose' | 'maintain' | 'gain') => {
    let calorieGoal = profile.dailyCalorieGoal || 2000;
    
    // Adjust calorie goal based on selected goal
    if (value === 'lose') calorieGoal = calorieGoal - 500;
    if (value === 'gain') calorieGoal = calorieGoal + 500;
    
    setProfile({
      ...profile,
      goal: value,
      dailyCalorieGoal: calorieGoal
    });
  };

  const handleDietPreferenceChange = (preference: string) => {
    const currentPreferences = [...(profile.dietaryPreferences || [])];
    if (currentPreferences.includes(preference)) {
      setProfile({
        ...profile,
        dietaryPreferences: currentPreferences.filter(p => p !== preference),
      });
    } else {
      setProfile({
        ...profile,
        dietaryPreferences: [...currentPreferences, preference],
      });
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = () => {
    const newUser: UserProfile = {
      id: uuidv4(),
      name: profile.name || 'User',
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal || 'maintain',
      dietaryPreferences: profile.dietaryPreferences || [],
      dailyCalorieGoal: profile.dailyCalorieGoal || 2000,
    };
    
    setUser(newUser);
    setOnboarded(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-nutrify-light p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-nutrify-dark">
            {step === 1 && "Welcome to Nutrify"}
            {step === 2 && "Set Your Goals"}
            {step === 3 && "Dietary Preferences"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="Enter your name" 
                  value={profile.name || ''} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input 
                  id="height" 
                  name="height"
                  type="number" 
                  placeholder="Height in cm" 
                  value={profile.height || ''} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input 
                  id="weight" 
                  name="weight"
                  type="number" 
                  placeholder="Weight in kg" 
                  value={profile.weight || ''} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What is your goal?</Label>
                <RadioGroup 
                  defaultValue={profile.goal} 
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
                  value={profile.dailyCalorieGoal || 2000} 
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">
                  Based on your goal, we've suggested a daily calorie target.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select any dietary preferences</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox 
                        id={preference} 
                        checked={(profile.dietaryPreferences || []).includes(preference)}
                        onCheckedChange={() => handleDietPreferenceChange(preference)}
                      />
                      <Label htmlFor={preference}>{preference}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={handlePrevStep}>Back</Button>
            ) : <div></div>}
            
            <Button onClick={handleNextStep} className="bg-nutrify-teal hover:bg-nutrify-teal/90">
              {step < 3 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
