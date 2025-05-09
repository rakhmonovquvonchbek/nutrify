
import { FoodItem, FoodAlternative } from '@/types/nutrify';
import { v4 as uuidv4 } from 'uuid';

// Enhanced mock food database - in a real app, this would be an API call
const foodDatabase = [
  {
    name: 'Apple',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    portion: '1 medium (182g)',
    tags: ['fruit', 'apple', 'red', 'green', 'fresh'],
  },
  {
    name: 'Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    portion: '1 medium (118g)',
    tags: ['fruit', 'banana', 'yellow', 'fresh'],
  },
  {
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    portion: '100g',
    tags: ['meat', 'chicken', 'protein', 'grilled', 'cooked'],
  },
  {
    name: 'Salmon',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 13,
    portion: '100g',
    tags: ['fish', 'seafood', 'protein', 'salmon', 'cooked'],
  },
  {
    name: 'Greek Yogurt',
    calories: 100,
    protein: 10,
    carbs: 4,
    fat: 5,
    portion: '100g',
    tags: ['dairy', 'yogurt', 'protein', 'white'],
  },
  {
    name: 'Mixed Salad with Grilled Chicken',
    calories: 350,
    protein: 25,
    carbs: 12,
    fat: 18,
    portion: '1 bowl (300g)',
    tags: ['salad', 'chicken', 'vegetable', 'mixed', 'green', 'healthy'],
  },
  {
    name: 'Pasta with Tomato Sauce',
    calories: 285,
    protein: 10,
    carbs: 54,
    fat: 2.5,
    portion: '1 cup (200g)',
    tags: ['pasta', 'carbs', 'tomato', 'sauce', 'italian'],
  },
  {
    name: 'Steak with Vegetables',
    calories: 450,
    protein: 40,
    carbs: 15,
    fat: 22,
    portion: '1 plate (350g)',
    tags: ['meat', 'beef', 'steak', 'protein', 'vegetable', 'cooked'],
  },
  {
    name: 'Chocolate Cake',
    calories: 370,
    protein: 5,
    carbs: 50,
    fat: 18,
    portion: '1 slice (100g)',
    tags: ['dessert', 'cake', 'chocolate', 'sweet', 'brown'],
  },
  {
    name: 'Pizza Slice',
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 12,
    portion: '1 slice (100g)',
    tags: ['pizza', 'fast food', 'cheese', 'italian'],
  },
  {
    name: 'Burger with Fries',
    calories: 750,
    protein: 25,
    carbs: 65,
    fat: 40,
    portion: '1 meal (400g)',
    tags: ['burger', 'fast food', 'fries', 'meat', 'potato'],
  },
  {
    name: 'Sushi Roll',
    calories: 350,
    protein: 15,
    carbs: 65,
    fat: 3,
    portion: '8 pieces (230g)',
    tags: ['sushi', 'japanese', 'rice', 'fish', 'seafood'],
  },
];

// Helper function to simulate AI image analysis
const simulateImageAnalysis = (imageUrl: string): string[] => {
  // In a real app, this would be an API call to an AI vision service
  // For demo, we'll use the timestamp to generate semi-random results
  // This ensures different photos get different results
  
  const timestamp = new Date().getTime();
  const randomSeed = timestamp % 20; // Use timestamp as a seed for randomness
  
  // Extract random tags based on the seed
  let detectedTags: string[] = [];
  
  // Use the timestamp to pick different food types
  if (randomSeed < 5) {
    detectedTags = ['fruit', randomSeed < 2 ? 'apple' : 'banana', 'fresh'];
  } else if (randomSeed < 10) {
    detectedTags = ['protein', randomSeed < 7 ? 'chicken' : 'fish', 'cooked'];
  } else if (randomSeed < 15) {
    detectedTags = ['carbs', randomSeed < 12 ? 'pasta' : 'rice', 'cooked'];
  } else {
    detectedTags = ['mixed', 'meal', randomSeed < 17 ? 'salad' : 'fast food'];
  }
  
  return detectedTags;
};

// Calculate match score between detected tags and food item
const calculateMatchScore = (foodTags: string[], detectedTags: string[]): number => {
  let matchCount = 0;
  
  for (const detectedTag of detectedTags) {
    if (foodTags.includes(detectedTag)) {
      matchCount++;
    }
  }
  
  // Calculate confidence percentage
  const maxPossibleMatches = Math.min(foodTags.length, detectedTags.length);
  return maxPossibleMatches > 0 ? (matchCount / maxPossibleMatches) * 100 : 0;
};

// Match detected tags to food items and return ranked results
const matchFoodItems = (detectedTags: string[]): FoodItem[] => {
  const results = foodDatabase.map((food) => {
    const confidence = calculateMatchScore(food.tags, detectedTags);
    
    return {
      id: uuidv4(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      portion: food.portion,
      timestamp: Date.now(),
      confidence: confidence,
    };
  });
  
  // Sort by confidence score
  return results
    .filter(item => item.confidence > 30) // Only return items with reasonable confidence
    .sort((a, b) => b.confidence! - a.confidence!)
    .slice(0, 5); // Return top 5 matches
};

export interface RecognitionResult {
  mainResult: FoodItem | null;
  alternatives: FoodAlternative[];
  error?: string;
}

export const recognizeFood = async (imageUrl: string): Promise<RecognitionResult> => {
  try {
    // Simulate processing delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Analyze image and get tags
    const detectedTags = simulateImageAnalysis(imageUrl);
    console.log('Detected tags:', detectedTags);
    
    // Match tags to food database
    const matchedItems = matchFoodItems(detectedTags);
    
    if (matchedItems.length === 0) {
      return {
        mainResult: null,
        alternatives: [],
        error: 'Could not recognize food in image. Try taking another photo with better lighting.'
      };
    }
    
    // First item is the main result
    const mainResult = matchedItems[0];
    
    // Rest are alternatives
    const alternatives = matchedItems.slice(1).map(item => ({
      id: item.id,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      portion: item.portion,
      confidence: item.confidence || 0
    }));
    
    return {
      mainResult,
      alternatives
    };
  } catch (error) {
    console.error('Food recognition error:', error);
    return {
      mainResult: null,
      alternatives: [],
      error: 'An error occurred during food recognition.'
    };
  }
};
