
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, FoodItem, DailyLog } from '../types/nutrify';

interface NutrifyContextType {
  user: UserProfile | null;
  currentDate: string;
  todaysLog: DailyLog | null;
  isOnboarded: boolean;
  recentFoods: FoodItem[];
  favoriteFoods: FoodItem[];
  setUser: (user: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addFoodItem: (item: FoodItem) => void;
  setOnboarded: (value: boolean) => void;
  addToFavorites: (item: FoodItem) => void;
  removeFromFavorites: (id: string) => void;
}

const defaultContext: NutrifyContextType = {
  user: null,
  currentDate: new Date().toISOString().split('T')[0],
  todaysLog: null,
  isOnboarded: false,
  recentFoods: [],
  favoriteFoods: [],
  setUser: () => {},
  updateUserProfile: () => {},
  addFoodItem: () => {},
  setOnboarded: () => {},
  addToFavorites: () => {},
  removeFromFavorites: () => {},
};

const NutrifyContext = createContext<NutrifyContextType>(defaultContext);

export const useNutrify = () => useContext(NutrifyContext);

export const NutrifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [currentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [todaysLog, setTodaysLog] = useState<DailyLog | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('nutrify_user');
    const savedOnboarded = localStorage.getItem('nutrify_onboarded');
    const savedTodaysLog = localStorage.getItem('nutrify_todaysLog');
    const savedRecentFoods = localStorage.getItem('nutrify_recentFoods');
    const savedFavoriteFoods = localStorage.getItem('nutrify_favoriteFoods');

    if (savedUser) setUserState(JSON.parse(savedUser));
    if (savedOnboarded) setIsOnboarded(JSON.parse(savedOnboarded));
    if (savedTodaysLog) setTodaysLog(JSON.parse(savedTodaysLog));
    if (savedRecentFoods) setRecentFoods(JSON.parse(savedRecentFoods));
    if (savedFavoriteFoods) setFavoriteFoods(JSON.parse(savedFavoriteFoods));
    else {
      // Initialize with empty log for today
      setTodaysLog({
        date: currentDate,
        foodItems: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
    }
  }, [currentDate]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (user) localStorage.setItem('nutrify_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nutrify_onboarded', JSON.stringify(isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    if (todaysLog) localStorage.setItem('nutrify_todaysLog', JSON.stringify(todaysLog));
  }, [todaysLog]);

  useEffect(() => {
    if (recentFoods.length) localStorage.setItem('nutrify_recentFoods', JSON.stringify(recentFoods));
  }, [recentFoods]);

  useEffect(() => {
    if (favoriteFoods.length) localStorage.setItem('nutrify_favoriteFoods', JSON.stringify(favoriteFoods));
  }, [favoriteFoods]);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUserState({ ...user, ...updates });
    }
  };

  const setOnboarded = (value: boolean) => {
    setIsOnboarded(value);
  };

  const addFoodItem = (item: FoodItem) => {
    if (todaysLog) {
      const updatedLog = {
        ...todaysLog,
        foodItems: [...todaysLog.foodItems, item],
        totalCalories: todaysLog.totalCalories + item.calories,
        totalProtein: todaysLog.totalProtein + item.protein,
        totalCarbs: todaysLog.totalCarbs + item.carbs,
        totalFat: todaysLog.totalFat + item.fat,
      };
      setTodaysLog(updatedLog);

      // Update recent foods
      const updatedRecentFoods = [item, ...recentFoods.filter(food => food.id !== item.id)].slice(0, 10);
      setRecentFoods(updatedRecentFoods);
    }
  };

  const addToFavorites = (item: FoodItem) => {
    if (!favoriteFoods.some(food => food.id === item.id)) {
      setFavoriteFoods([...favoriteFoods, item]);
    }
  };

  const removeFromFavorites = (id: string) => {
    setFavoriteFoods(favoriteFoods.filter(food => food.id !== id));
  };

  const value = {
    user,
    currentDate,
    todaysLog,
    isOnboarded,
    recentFoods,
    favoriteFoods,
    setUser,
    updateUserProfile,
    addFoodItem,
    setOnboarded,
    addToFavorites,
    removeFromFavorites,
  };

  return <NutrifyContext.Provider value={value}>{children}</NutrifyContext.Provider>;
};
