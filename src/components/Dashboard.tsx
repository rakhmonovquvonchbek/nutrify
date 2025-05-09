
import { useNutrify } from "@/context/NutrifyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FoodItem } from "@/types/nutrify";
import { formatDistanceToNow } from 'date-fns';
import NavBar from "./NavBar";

const MacroProgress = ({ label, current, total, color }: { label: string; current: number; total: number; color: string }) => {
  const percentage = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {current.toFixed(1)}g / {total.toFixed(1)}g
        </span>
      </div>
      <Progress value={percentage} className={`h-2 ${color}`} />
    </div>
  );
};

const FoodListItem = ({ food }: { food: FoodItem }) => {
  const timeAgo = formatDistanceToNow(new Date(food.timestamp), { addSuffix: true });
  
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100">
      <div>
        <h4 className="font-medium">{food.name}</h4>
        <p className="text-sm text-muted-foreground">{food.portion} · {timeAgo}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{food.calories} kcal</p>
        <p className="text-xs text-muted-foreground">
          P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, todaysLog } = useNutrify();

  if (!user || !todaysLog) return <div>Loading...</div>;

  const caloriesRemaining = user.dailyCalorieGoal - todaysLog.totalCalories;
  const caloriePercentage = Math.min(100, (todaysLog.totalCalories / user.dailyCalorieGoal) * 100);
  
  // Calculate macro targets (simplified calculation)
  const proteinTarget = user.dailyCalorieGoal * 0.3 / 4; // 30% of calories from protein, 4 calories per gram
  const carbTarget = user.dailyCalorieGoal * 0.45 / 4; // 45% of calories from carbs, 4 calories per gram
  const fatTarget = user.dailyCalorieGoal * 0.25 / 9; // 25% of calories from fat, 9 calories per gram

  return (
    <div className="min-h-screen bg-nutrify-light pb-24">
      {/* Header */}
      <div className="bg-nutrify-teal text-white p-6">
        <h1 className="text-2xl font-semibold">Hello, {user.name}</h1>
        <p>Let's track your nutrition today</p>
      </div>
      
      {/* Calorie Summary */}
      <Card className="mx-4 -mt-6 shadow-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Daily Summary</h2>
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
          
          <div className="relative pt-4 pb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>0</span>
              <span>{user.dailyCalorieGoal} kcal</span>
            </div>
            <Progress value={caloriePercentage} className="h-3" />
            <div className="mt-2 text-center">
              <span className="text-xl font-semibold">
                {caloriesRemaining > 0 ? `${caloriesRemaining} kcal remaining` : 'Daily goal reached'}
              </span>
              <p className="text-sm text-muted-foreground">
                {todaysLog.totalCalories} consumed / {user.dailyCalorieGoal} goal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Macronutrient Breakdown */}
      <Card className="mx-4 mt-4 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Macronutrients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MacroProgress 
            label="Protein" 
            current={todaysLog.totalProtein} 
            total={proteinTarget} 
            color="bg-blue-400"
          />
          <MacroProgress 
            label="Carbs" 
            current={todaysLog.totalCarbs} 
            total={carbTarget} 
            color="bg-green-400"
          />
          <MacroProgress 
            label="Fat" 
            current={todaysLog.totalFat} 
            total={fatTarget} 
            color="bg-yellow-400"
          />
        </CardContent>
      </Card>
      
      {/* Today's Food Log */}
      <Card className="mx-4 mt-4 shadow-md mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Today's Food</CardTitle>
        </CardHeader>
        <CardContent>
          {todaysLog.foodItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No food logged yet today.<br />
              Snap a photo or search to add food.
            </p>
          ) : (
            <div>
              {todaysLog.foodItems
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(food => (
                  <FoodListItem key={food.id} food={food} />
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bottom Navigation */}
      <NavBar />
    </div>
  );
};

export default Dashboard;
