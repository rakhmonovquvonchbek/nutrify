
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
import { Progress } from '@/components/ui/progress';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Check } from 'lucide-react';

// Form validation schema for the welcome step
const welcomeSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(50),
});

// Form validation schema for the personal details step
const personalDetailsSchema = z.object({
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
});

// Form validation schema for the goals step
const goalsSchema = z.object({
  goal: z.enum(['lose', 'maintain', 'gain'], { 
    required_error: 'Please select a goal' 
  }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very_active'], { 
    required_error: 'Please select an activity level' 
  }),
  dietaryPreferences: z.array(z.string()).min(1, { message: 'Select at least one dietary preference' }),
});

type WelcomeFormData = z.infer<typeof welcomeSchema>;
type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
type GoalsFormData = z.infer<typeof goalsSchema>;

const WelcomeStep = ({ 
  onNext, 
  initialData 
}: { 
  onNext: (data: WelcomeFormData) => void, 
  initialData?: Partial<WelcomeFormData> 
}) => {
  const form = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  const onSubmit = (data: WelcomeFormData) => {
    onNext(data);
  };

  return (
    <div className="flex flex-col items-center text-center space-y-8 p-4">
      <img 
        src="/placeholder.svg" 
        alt="Nutrify Logo" 
        className="w-24 h-24 rounded-full bg-nutrify-teal p-4"
      />
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Nutrify</h2>
        <p className="text-muted-foreground">
          Track nutrition effortlessly with AI. Just take a photo of your food to track calories.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What should we call you?</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full bg-nutrify-teal hover:bg-nutrify-teal/90">
            Let's Get Started
          </Button>
        </form>
      </Form>
    </div>
  );
};

const PersonalDetailsStep = ({ 
  onNext, 
  onBack, 
  initialData 
}: { 
  onNext: (data: PersonalDetailsFormData) => void, 
  onBack: () => void, 
  initialData?: Partial<PersonalDetailsFormData> 
}) => {
  const [usingMetric, setUsingMetric] = useState(initialData?.measurementSystem !== 'imperial');
  
  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      age: initialData?.age || 30,
      gender: initialData?.gender || 'male',
      measurementSystem: initialData?.measurementSystem || 'metric',
      height: initialData?.height || 170,
      weight: initialData?.weight || 70,
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

  const onSubmit = (data: PersonalDetailsFormData) => {
    onNext(data);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="bg-nutrify-teal hover:bg-nutrify-teal/90"
            >
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const GoalsStep = ({ 
  onNext, 
  onBack,
  initialData 
}: { 
  onNext: (data: GoalsFormData) => void, 
  onBack: () => void,
  initialData?: Partial<GoalsFormData> 
}) => {
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
  
  const form = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      goal: initialData?.goal || 'maintain',
      activityLevel: initialData?.activityLevel || 'moderate',
      dietaryPreferences: initialData?.dietaryPreferences || ['omnivore'],
    },
  });

  const onSubmit = (data: GoalsFormData) => {
    onNext(data);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6">Your Goals</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="bg-nutrify-teal hover:bg-nutrify-teal/90"
            >
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const SummaryStep = ({ 
  onComplete, 
  onBack, 
  userData 
}: { 
  onComplete: () => void, 
  onBack: () => void,
  userData: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    measurementSystem: 'metric' | 'imperial';
    height: number;
    weight: number;
    goal: 'lose' | 'maintain' | 'gain';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
    dietaryPreferences: string[];
  }
}) => {
  const { setUser, setOnboarded } = useNutrify();
  
  // Calculate daily calorie goal based on user data
  const calculateCalorieGoal = () => {
    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr = 0;
    
    // Convert height and weight if using imperial
    const heightInCm = userData.measurementSystem === 'metric' 
      ? userData.height 
      : userData.height * 2.54;
      
    const weightInKg = userData.measurementSystem === 'metric' 
      ? userData.weight 
      : userData.weight / 2.205;
    
    if (userData.gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * userData.age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * userData.age - 161;
    }
    
    // Activity level multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725
    };
    
    let calories = bmr * activityMultipliers[userData.activityLevel];
    
    // Adjust based on goal
    if (userData.goal === 'lose') {
      calories *= 0.8; // 20% deficit
    } else if (userData.goal === 'gain') {
      calories *= 1.15; // 15% surplus
    }
    
    return Math.round(calories);
  };
  
  const handleComplete = () => {
    // Create the user profile
    const userProfile = {
      id: uuidv4(),
      ...userData,
      dailyCalorieGoal: calculateCalorieGoal(),
    };
    
    setUser(userProfile);
    setOnboarded(true);
    onComplete();
  };
  
  // Helper to format the activity level for display
  const formatActivityLevel = (level: string) => {
    switch(level) {
      case 'sedentary': return 'Sedentary';
      case 'light': return 'Light Activity';
      case 'moderate': return 'Moderate Activity';
      case 'very_active': return 'Very Active';
      default: return level;
    }
  };
  
  // Helper to format the goal for display
  const formatGoal = (goal: string) => {
    switch(goal) {
      case 'lose': return 'Lose Weight';
      case 'maintain': return 'Maintain Weight';
      case 'gain': return 'Gain Weight';
      default: return goal;
    }
  };

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Profile Created</h2>
        <p className="text-muted-foreground">Let's review your information</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name:</dt>
              <dd className="font-medium">{userData.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Age:</dt>
              <dd className="font-medium">{userData.age}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Gender:</dt>
              <dd className="font-medium capitalize">{userData.gender}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Height:</dt>
              <dd className="font-medium">
                {userData.height} {userData.measurementSystem === 'metric' ? 'cm' : 'in'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Weight:</dt>
              <dd className="font-medium">
                {userData.weight} {userData.measurementSystem === 'metric' ? 'kg' : 'lbs'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Goal:</dt>
              <dd className="font-medium">{formatGoal(userData.goal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Activity Level:</dt>
              <dd className="font-medium">{formatActivityLevel(userData.activityLevel)}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-muted-foreground mb-1">Dietary Preferences:</dt>
              <dd className="font-medium">
                <div className="flex flex-wrap gap-2">
                  {userData.dietaryPreferences.map(pref => (
                    <span key={pref} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {pref}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div className="flex justify-between pt-4 border-t mt-4">
              <dt className="text-muted-foreground">Daily Calorie Target:</dt>
              <dd className="font-semibold text-nutrify-teal">
                {calculateCalorieGoal()} kcal
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={handleComplete} 
          className="bg-nutrify-teal hover:bg-nutrify-teal/90"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<any>({
    name: '',
    age: 30,
    gender: 'male',
    measurementSystem: 'metric',
    height: 170,
    weight: 70,
    goal: 'maintain',
    activityLevel: 'moderate',
    dietaryPreferences: ['omnivore'],
  });
  
  const updateUserData = (data: any) => {
    setUserData(prev => ({ ...prev, ...data }));
  };
  
  const handleNext = (data: any) => {
    updateUserData(data);
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  const handleComplete = () => {
    // This is called after the user profile has been created 
    // in the SummaryStep component
    console.log('Onboarding complete');
  };
  
  // Calculate progress percentage based on current step
  const progressPercentage = ((step - 1) / 3) * 100;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <Progress value={progressPercentage} className="h-1 rounded-none" />
      </div>
      
      <div className="max-w-md mx-auto pt-8 pb-16">
        {step === 1 && (
          <WelcomeStep 
            onNext={(data) => handleNext(data)} 
            initialData={userData}
          />
        )}
        
        {step === 2 && (
          <PersonalDetailsStep 
            onNext={(data) => handleNext(data)} 
            onBack={handleBack}
            initialData={userData}
          />
        )}
        
        {step === 3 && (
          <GoalsStep 
            onNext={(data) => handleNext(data)} 
            onBack={handleBack}
            initialData={userData}
          />
        )}
        
        {step === 4 && (
          <SummaryStep 
            onComplete={handleComplete} 
            onBack={handleBack}
            userData={userData}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
