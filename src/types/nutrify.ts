
export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  gender?: 'male' | 'female' | 'other';
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active';
  dietaryPreferences: string[];
  dailyCalorieGoal: number;
  measurementSystem: 'metric' | 'imperial';
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  portion: string;
  imageUrl?: string;
  timestamp: number;
  confidence?: number; // recognition confidence score
  alternatives?: FoodAlternative[]; // alternative recognition options
}

export interface FoodAlternative {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  confidence: number;
}

export interface DailyLog {
  date: string; // ISO string format YYYY-MM-DD
  foodItems: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}
