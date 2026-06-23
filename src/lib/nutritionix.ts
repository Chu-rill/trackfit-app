import { NutritionixFood } from '../types';

const APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID;
const API_KEY = import.meta.env.VITE_NUTRITIONIX_API_KEY;
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

const headers = {
  'Content-Type': 'application/json',
  'x-app-id': APP_ID || '',
  'x-app-key': API_KEY || '',
};

/**
 * Search for food items by query
 */
export async function searchFoods(query: string): Promise<NutritionixFood[]> {
  try {
    const response = await fetch(`${BASE_URL}/search/instant?query=${encodeURIComponent(query)}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to search foods');
    }

    const data = await response.json();
    return [...(data.common || []), ...(data.branded || [])];
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
  }
}

/**
 * Get detailed nutrition information for a food item
 */
export async function getNutritionDetails(foodName: string): Promise<NutritionixFood> {
  try {
    const response = await fetch(`${BASE_URL}/natural/nutrients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: foodName }),
    });

    if (!response.ok) {
      throw new Error('Failed to get nutrition details');
    }

    const data = await response.json();
    return data.foods[0];
  } catch (error) {
    console.error('Error getting nutrition details:', error);
    throw error;
  }
}

/**
 * Search for food by barcode/UPC
 */
export async function searchByBarcode(barcode: string): Promise<NutritionixFood> {
  try {
    const response = await fetch(`${BASE_URL}/search/item?upc=${barcode}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Food not found for this barcode');
    }

    const data = await response.json();
    return data.foods[0];
  } catch (error) {
    console.error('Error searching by barcode:', error);
    throw error;
  }
}
