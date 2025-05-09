
import { useState } from 'react';
import { useNutrify } from '@/context/NutrifyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(50),
  age: z.number().min(18, { message: 'Age must be at least 18' }).max(100),
  gender: z.enum(['male', 'female', 'other'], { 
    required_error: 'Please select a gender option' 
  }),
  measurementSystem: z.enum(['metric', 'imperial']),
  height: z.number()
    .min(60, { message: 'Height seems too low' })
    .max(250, { message: 'Height seems too high' }),
  weight: z.number()
    .min(30, { message: 'Weight seems too low' })
    .max(300, { message: 'Weight seems too high' }),
  goal: z.enum(['lose', 'maintain', 'gain'], { 
    required_error: 'Please select a goal' 
  }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very_active'], { 
    required_error: 'Please select an activity level' 
  }),
  dietaryPreferences: z.array(z.string()).min(1, { message: 'Select at least one dietary preference' }),
  dailyCalorieGoal: z.number().min(1200, { message: 'Calorie goal should be at least 1200' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EnhancedProfile = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useNutrify();
  const [usingMetric, setUsingMetric] = useState(user?.measurementSystem !== 'imperial');
  
  const dietaryOptions = [
    { id: 'omnivore', label: 'Omnivore' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'keto', label: 'Keto' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
  ];
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      age: user.age || 30,
      gender: user.gender || 'male',
      measurementSystem: user.measurementSystem || 'metric',
      height: user.height || 170,
      weight: user.weight || 70,
      goal: user.goal,
      activityLevel: user.activityLevel || 'moderate',
      dietaryPreferences: user.dietaryPreferences,
      dailyCalorieGoal: user.dailyCalorieGoal,
    },
  });
  
  const toggleMeasurementSystem = (useMetric: boolean) => {
    const currentHeight = form.getValues('height');
    const currentWeight = form.getValues('weight');
    
    if (useMetric) {
      // Convert from imperial to metric
      const heightInCm = Math.round(currentHeight * 2.54); // inches to cm
      const weightInKg = Math.round(currentWeight / 2.205); // lbs to kg
      
      form.setValue('height', heightInCm);
      form.setValue('weight', weightInKg);
      form.setValue('measurementSystem', 'metric');
    } else {
      // Convert from metric to imperial
      const heightInInches = Math.round(currentHeight / 2.54); // cm to inches
      const weightInLbs = Math.round(currentWeight * 2.205); // kg to lbs
      
      form.setValue('height', heightInInches);
      form.setValue('weight', weightInLbs);
      form.setValue('measurementSystem', 'imperial');
    }
    
    setUsingMetric(useMetric);
  };
  
  // Calculate daily calorie goal based on user data
  const calculateCalorieGoal = (data: ProfileFormData) => {
    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr = 0;
    
    // Convert height and weight if using imperial
    const heightInCm = data.measurementSystem === 'metric' 
      ? data.height 
      : data.height * 2.54;
      
    const weightInKg = data.measurementSystem === 'metric' 
      ? data.weight 
      : data.weight / 2.205;
    
    if (data.gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age - 161;
    }
    
    // Activity level multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725
    };
    
    let calories = bmr * activityMultipliers[data.activityLevel];
    
    // Adjust based on goal
    if (data.goal === 'lose') {
      calories *= 0.8; // 20% deficit
    } else if (data.goal === 'gain') {
      calories *= 1.15; // 15% surplus
    }
    
    return Math.round(calories);
  };

  const onSubmit = (data: ProfileFormData) => {
    // Recalculate daily calorie goal based on new profile data
    const calculatedCalories = calculateCalorieGoal(data);
    
    // Update the profile
    updateUserProfile({ 
      ...data,
      dailyCalorieGoal: data.dailyCalorieGoal !== user.dailyCalorieGoal 
        ? data.dailyCalorieGoal  // User manually changed it
        : calculatedCalories     // Use calculated value
    });
    
    toast("Profile updated successfully");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-nutrify-light pb-8">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Edit Profile</h1>
        </div>
      </div>
      
      <div className="p-4 max-w-md mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Male
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Female
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="other" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Other
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Body Measurements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Measurement System</FormLabel>
                    <div className="flex items-center space-x-2">
                      <span className={!usingMetric ? 'font-medium' : 'text-muted-foreground'}>Imperial</span>
                      <Switch 
                        checked={usingMetric} 
                        onCheckedChange={toggleMeasurementSystem}
                      />
                      <span className={usingMetric ? 'font-medium' : 'text-muted-foreground'}>Metric</span>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Height {usingMetric ? '(cm)' : '(inches)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormDescription>
                        {usingMetric ? 'In centimeters' : 'In inches'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Weight {usingMetric ? '(kg)' : '(lbs)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormDescription>
                        {usingMetric ? 'In kilograms' : 'In pounds'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Goals & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What's your goal?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="lose" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Lose Weight
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="maintain" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Maintain Weight
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="gain" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Gain Weight
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Activity Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="sedentary" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Sedentary (little or no exercise)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="light" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Light (exercise 1-3 days/week)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="moderate" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Moderate (exercise 3-5 days/week)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="very_active" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Very Active (exercise 6-7 days/week)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Dietary Preferences</FormLabel>
                        <FormDescription>
                          Select any dietary preferences that apply to you.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {dietaryOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="dietaryPreferences"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dailyCalorieGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Calorie Goal</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            const calculatedGoal = calculateCalorieGoal(form.getValues());
                            form.setValue('dailyCalorieGoal', calculatedGoal);
                          }}
                        >
                          Recalculate
                        </Button>
                      </div>
                      <FormDescription>
                        Calories per day based on your profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Button type="submit" className="w-full bg-nutrify-teal hover:bg-nutrify-teal/90">
              Save Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EnhancedProfile;
