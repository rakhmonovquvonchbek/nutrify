
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNutrify } from "@/context/NutrifyContext";
import { FoodItem } from "@/types/nutrify";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Mock food database
const mockFoodDatabase: FoodItem[] = [
  {
    id: "1",
    name: "Apple",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    portion: "1 medium (182g)",
    timestamp: Date.now(),
  },
  {
    id: "2",
    name: "Banana",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    portion: "1 medium (118g)",
    timestamp: Date.now(),
  },
  {
    id: "3",
    name: "Grilled Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    portion: "100g",
    timestamp: Date.now(),
  },
  {
    id: "4",
    name: "Brown Rice",
    calories: 215,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    portion: "1 cup cooked (195g)",
    timestamp: Date.now(),
  },
  {
    id: "5",
    name: "Salmon",
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 13,
    portion: "100g",
    timestamp: Date.now(),
  },
  {
    id: "6",
    name: "Avocado",
    calories: 234,
    protein: 2.9,
    carbs: 12.5,
    fat: 21,
    portion: "1 whole (201g)",
    timestamp: Date.now(),
  },
  {
    id: "7",
    name: "Greek Yogurt",
    calories: 100,
    protein: 10,
    carbs: 4,
    fat: 5,
    portion: "100g",
    timestamp: Date.now(),
  },
  {
    id: "8",
    name: "Oatmeal",
    calories: 166,
    protein: 5.9,
    carbs: 28,
    fat: 3.6,
    portion: "1 cup cooked (234g)",
    timestamp: Date.now(),
  },
];

interface FoodItemProps {
  food: FoodItem;
  onAdd: (food: FoodItem) => void;
}

const FoodListItem = ({ food, onAdd }: FoodItemProps) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100">
      <div>
        <h4 className="font-medium">{food.name}</h4>
        <p className="text-sm text-muted-foreground">{food.portion}</p>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="font-medium">{food.calories} kcal</p>
          <p className="text-xs text-muted-foreground">
            P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
          </p>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onAdd({...food, id: uuidv4(), timestamp: Date.now()})}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

const FoodSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addFoodItem, recentFoods, favoriteFoods, addToFavorites } = useNutrify();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      const results = mockFoodDatabase.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setActiveTab('search');
    }
  };
  
  const handleAddFood = (food: FoodItem) => {
    addFoodItem(food);
    toast({
      title: "Food Added",
      description: `${food.name} added to today's log.`
    });
  };
  
  const handleAddToFavorites = (food: FoodItem) => {
    addToFavorites(food);
    toast({
      title: "Added to Favorites",
      description: `${food.name} added to your favorites.`
    });
  };
  
  return (
    <div className="min-h-screen bg-nutrify-light pb-24">
      <div className="bg-white p-4 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Food Search</h1>
        </div>
        
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input 
            placeholder="Search for a food..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-nutrify-teal hover:bg-nutrify-teal/90">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      <div className="mt-28 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search">
            {searchQuery && (
              <Card>
                <CardContent className="p-4">
                  {searchResults.length > 0 ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Found {searchResults.length} results for "{searchQuery}"
                      </p>
                      <Separator className="mb-2" />
                      {searchResults.map(food => (
                        <FoodListItem 
                          key={food.id} 
                          food={food} 
                          onAdd={(food) => {
                            handleAddFood(food);
                            handleAddToFavorites(food);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                      <p className="text-sm mt-2">Try another search term or browse recent items</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {!searchQuery && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Enter a food name to search</p>
                <p className="text-sm mt-2">Example: apple, chicken, rice</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardContent className="p-4">
                {recentFoods.length > 0 ? (
                  <div>
                    {recentFoods.map(food => (
                      <FoodListItem 
                        key={food.id} 
                        food={food} 
                        onAdd={handleAddFood} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No recent foods</p>
                    <p className="text-sm mt-2">Foods you log will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="favorites">
            <Card>
              <CardContent className="p-4">
                {favoriteFoods.length > 0 ? (
                  <div>
                    {favoriteFoods.map(food => (
                      <FoodListItem 
                        key={food.id} 
                        food={food} 
                        onAdd={handleAddFood} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No favorite foods</p>
                    <p className="text-sm mt-2">Add foods to favorites when searching</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FoodSearch;
