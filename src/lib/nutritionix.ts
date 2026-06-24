import type {
  NutritionixFood,
  CalorieAPIFood,
  CalorieAPIBarcodeResponse,
} from "../types";

const API_KEY = import.meta.env.VITE_CALORIE_API_KEY;
const BASE_URL = "https://calorieapiadmin.com/api/v1";

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": API_KEY || "",
};

/**
 * Helper function to convert Calorie API food to NutritionixFood format
 */
function mapCalorieAPIToNutritionix(food: CalorieAPIFood): NutritionixFood {
  return {
    food_name: food.name,
    brand_name: food.brand || null,
    serving_qty: food.serving_qty || 1,
    serving_unit: food.serving_unit || "serving",
    serving_weight_grams: food.serving_weight_grams || 100,
    nf_calories: food.calories,
    nf_protein: food.protein,
    nf_total_carbohydrate: food.carbs,
    nf_total_fat: food.fat,
    nf_dietary_fiber: food.fiber || 0,
    nf_sugars: food.sugars || 0,
    nf_sodium: food.sodium || 0,
    nf_cholesterol: 0, // Calorie API doesn't provide this in basic response
    nf_saturated_fat: food.saturated_fat || 0,
    photo: {
      thumb: "", // Calorie API doesn't provide images in basic search
    },
    nix_item_id: food.id.toString(),
  };
}

/**
 * Helper function to convert barcode response to NutritionixFood format
 */
function mapBarcodeToNutritionix(
  data: CalorieAPIBarcodeResponse,
): NutritionixFood {
  const nutrition = data.nutrition_per_serving || data.nutrition_per_100g;

  return {
    food_name: data.product.name,
    brand_name: data.product.brand || null,
    serving_qty: data.serving.quantity,
    serving_unit: data.serving.unit,
    serving_weight_grams: data.serving.quantity, // Approximate
    nf_calories: nutrition.energy_kcal,
    nf_protein: nutrition.protein_g,
    nf_total_carbohydrate: nutrition.carbohydrates_g,
    nf_total_fat: nutrition.fat_g,
    nf_dietary_fiber: nutrition.fiber_g || 0,
    nf_sugars: nutrition.sugars_g || 0,
    nf_sodium: (nutrition.sodium_g || 0) * 1000, // Convert g to mg
    nf_cholesterol: 0,
    nf_saturated_fat: nutrition.saturated_fat_g || 0,
    photo: {
      thumb: "",
    },
    nix_item_id: data.barcode,
  };
}

/**
 * Search for food items by query using Calorie API
 */
export async function searchFoods(query: string): Promise<NutritionixFood[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/foods?q=${encodeURIComponent(query)}&limit=20`,
      {
        headers,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to search foods");
    }

    const data = await response.json();

    // Map Calorie API foods to NutritionixFood format
    const foods: CalorieAPIFood[] = data.foods || [];
    return foods.map(mapCalorieAPIToNutritionix);
  } catch (error) {
    console.error("Error searching foods:", error);
    throw error;
  }
}

/**
 * Get detailed nutrition information for a food item
 * For Calorie API, we search and return the best match
 */
export async function getNutritionDetails(
  foodName: string,
): Promise<NutritionixFood> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/foods?q=${encodeURIComponent(foodName)}&limit=1`,
      {
        headers,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get nutrition details");
    }

    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      throw new Error("No food found");
    }

    // Return the first (best match) result
    return mapCalorieAPIToNutritionix(data.foods[0]);
  } catch (error) {
    console.error("Error getting nutrition details:", error);
    throw error;
  }
}

/**
 * Search for food by barcode/UPC using Calorie API
 */
export async function searchByBarcode(
  barcode: string,
): Promise<NutritionixFood> {
  try {
    const response = await fetch(`${BASE_URL}/search/barcode/${barcode}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Food not found for this barcode");
    }

    const data: CalorieAPIBarcodeResponse = await response.json();
    return mapBarcodeToNutritionix(data);
  } catch (error) {
    console.error("Error searching by barcode:", error);
    throw error;
  }
}
