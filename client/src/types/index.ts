export type UnitPreference = 'metric' | 'imperial';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type GoalType =
  | 'lose_weight'
  | 'gain_weight'
  | 'maintain_weight'
  | 'build_muscle'
  | 'general_fitness';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  unit_preference: UnitPreference;
  created_at: string;
  updated_at: string;
}

export interface BodyStats {
  id: string;
  user_id: string;
  weight: number;
  height: number;
  activity_level: ActivityLevel;
  bmi: number | null;
  maintenance_calories: number | null;
  measured_at: string;
  created_at: string;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  target_weight: number | null;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fats: number | null;
  start_date: string;
  target_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  food_name: string;
  brand_name: string | null;
  serving_size: string | null;
  serving_unit: string | null;
  serving_weight_grams: number | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  saturated_fat: number | null;
  nutritionix_id: string | null;
  barcode: string | null;
  image_url: string | null;
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_item_id: string | null;
  food_name: string;
  meal_type: MealType | null;
  servings: number;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  image_url: string | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

// Calorie API response types
export interface CalorieAPIFood {
  id: number;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugars?: number;
  sodium?: number;
  saturated_fat?: number;
  serving_qty?: number;
  serving_unit?: string;
  serving_weight_grams?: number;
}

export interface CalorieAPIBarcodeResponse {
  barcode: string;
  product: {
    name: string;
    brand?: string;
    category?: string;
  };
  serving: {
    label: string;
    quantity: number;
    unit: string;
  };
  nutrition_per_100g: {
    energy_kcal: number;
    protein_g: number;
    carbohydrates_g: number;
    fat_g: number;
    fiber_g?: number;
    sugars_g?: number;
    sodium_g?: number;
    saturated_fat_g?: number;
  };
  nutrition_per_serving?: {
    energy_kcal: number;
    protein_g: number;
    carbohydrates_g: number;
    fat_g: number;
    fiber_g?: number;
    sugars_g?: number;
    sodium_g?: number;
    saturated_fat_g?: number;
  };
}

// Unified food interface for components (backwards compatible)
export interface NutritionixFood {
  food_name: string;
  brand_name: string | null;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  nf_calories: number;
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
  nf_dietary_fiber: number;
  nf_sugars: number;
  nf_sodium: number;
  nf_cholesterol: number;
  nf_saturated_fat: number;
  photo: {
    thumb: string;
  };
  nix_item_id?: string;
}

export interface DailyNutrition {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number;
  meal_breakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
}
