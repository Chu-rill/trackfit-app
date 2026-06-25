# Nutrition Module

Integrates with the Calorie API (BusyBody) to provide food nutrition data through text search and barcode scanning.

## Structure

```
nutrition/
├── dto/
│   ├── search-food.dto.ts     # Food search validation
│   ├── analyze-image.dto.ts   # Image analysis validation
│   └── scan-barcode.dto.ts    # Barcode scan validation
├── nutrition.controller.ts     # Nutrition endpoints
├── nutrition.module.ts         # Module definition
└── nutrition.service.ts        # Calorie API integration
```

## Features

- Food database search by text query (up to 20 results)
- Barcode/UPC scanning for packaged foods
- Server-side API key management
- Calorie API v1 integration

## Prerequisites

You need a Calorie API key:
1. Sign up at https://calorieapi.com/auth/register (free tier available)
2. Get your API key from your dashboard
3. Add it to your `.env` file as `CALORIE_API_KEY`

## Endpoints

### POST /api/nutrition/search
Search for food by text query.

**Request Body:**
```json
{
  "query": "1 apple"
}
```

**Response:**
Returns Calorie API response with an array of food items:
```json
{
  "foods": [
    {
      "id": 123,
      "name": "Apple",
      "brand": null,
      "calories": 95,
      "protein": 0.5,
      "carbs": 25,
      "fat": 0.3,
      "fiber": 4.4,
      "sugars": 19,
      "sodium": 2,
      "serving_qty": 1,
      "serving_unit": "medium",
      "serving_weight_grams": 182
    }
  ]
}
```

### POST /api/nutrition/analyze-image
**Status:** Not Implemented

**Response:**
```json
{
  "statusCode": 501,
  "message": "Image analysis not implemented. Use a vision API to identify food first, then search.",
  "error": "Not Implemented"
}
```

**Note:** Calorie API doesn't provide direct image analysis. To implement this feature, integrate a vision API (Google Vision, OpenAI Vision, etc.) to identify food items from images, then use the `/search` endpoint with the identified food name.

### POST /api/nutrition/scan-barcode
Scan a product barcode for nutrition info.

**Request Body:**
```json
{
  "barcode": "012345678912"
}
```

**Response:**
Returns product nutrition data from Calorie API database:
```json
{
  "barcode": "012345678912",
  "product": {
    "name": "Product Name",
    "brand": "Brand Name",
    "category": "Food & Beverages"
  },
  "serving": {
    "label": "1 serving",
    "quantity": 100,
    "unit": "g"
  },
  "nutrition_per_serving": {
    "energy_kcal": 250,
    "protein_g": 8,
    "carbohydrates_g": 30,
    "fat_g": 10,
    "fiber_g": 3,
    "sugars_g": 5,
    "sodium_g": 0.5,
    "saturated_fat_g": 2
  }
}
```

## Configuration

Environment variables required:
- `CALORIE_API_KEY` - Your Calorie API key (get from https://calorieapi.com)

## Error Handling

All external API errors are caught and transformed into NestJS HttpExceptions with appropriate status codes:
- 400: Bad request (invalid query)
- 404: Food not found
- 500: API unavailable or other errors

## Usage Example

```typescript
// In a controller or service
constructor(private nutritionService: NutritionService) {}

async searchFood() {
  const result = await this.nutritionService.searchFood('chicken breast');
  return result;
}
```

## API Rate Limits

Free tier Calorie API has generous rate limits:
- Check Calorie API documentation for current limits
- Results are limited to 20 items per search query
- Implement caching for frequently searched items
- Consider storing results in the FoodItem table

## Response Format

The Calorie API returns data in a slightly different format than other nutrition APIs:
- Macros are in grams (g)
- Sodium in grams (convert to mg by multiplying by 1000)
- Energy in kilocalories (kcal)
- Serving sizes vary by food item

## Future Improvements

- [ ] Add caching layer for frequent searches
- [ ] Implement retry logic for failed API calls
- [ ] Add custom food database fallback
- [ ] Integrate vision API for image analysis
- [ ] Add nutrition data normalization/mapping
- [ ] Implement search result ranking
