import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Calorie API types
interface CalorieAPIFood {
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

interface CalorieAPIBarcodeResponse {
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

@Injectable()
export class NutritionService {
  private readonly calorieApiKey: string;
  private readonly calorieApiUrl = 'https://calorieapiadmin.com/api/v1';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.calorieApiKey = this.configService.get('CALORIE_API_KEY');
  }

  async searchFood(query: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.calorieApiUrl}/search/foods?q=${encodeURIComponent(query)}&limit=20`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.calorieApiKey,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to search food',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeImage(imageUrl: string) {
    // Note: Calorie API doesn't have direct image analysis
    // You might need to integrate with a different service like Google Vision API
    // or OpenAI Vision API for image recognition, then search the result
    throw new HttpException(
      'Image analysis not implemented. Use a vision API to identify food first, then search.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async scanBarcode(barcode: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.calorieApiUrl}/search/barcode/${barcode}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.calorieApiKey,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Food not found for this barcode',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }
}
