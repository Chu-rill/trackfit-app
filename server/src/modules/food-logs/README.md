# Food Logs Module

Manages user food logging, tracking daily nutrition intake, and providing statistical summaries.

## Structure

```
food-logs/
├── dto/
│   ├── create-food-log.dto.ts  # Create food log validation
│   └── update-food-log.dto.ts  # Update food log validation
├── food-logs.controller.ts      # Food log endpoints
├── food-logs.module.ts          # Module definition
└── food-logs.service.ts         # Business logic
```

## Features

- Create, read, update, and delete food logs
- Filter logs by date
- Calculate daily/weekly/monthly statistics
- Meal type categorization
- Automatic totals calculation
- User-specific data isolation

## Endpoints

### POST /api/food-logs
Create a new food log entry.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "foodName": "Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "servingSize": 100,
  "servingUnit": "g",
  "mealType": "lunch",
  "notes": "Grilled, no skin"
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "user_uuid",
  "foodName": "Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "servingSize": 100,
  "servingUnit": "g",
  "mealType": "lunch",
  "notes": "Grilled, no skin",
  "createdAt": "2024-01-15T12:30:00Z",
  "loggedAt": "2024-01-15T12:30:00Z"
}
```

### GET /api/food-logs
Get all food logs for the current user.

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD format)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "foodName": "Chicken Breast",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "mealType": "lunch",
    "createdAt": "2024-01-15T12:30:00Z"
  }
]
```

### GET /api/food-logs/:id
Get a specific food log by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### PUT /api/food-logs/:id
Update a food log.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "servingSize": 150,
  "notes": "Updated portion size"
}
```

### DELETE /api/food-logs/:id
Delete a food log.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### GET /api/food-logs/stats/summary
Get statistical summary of food logs.

**Query Parameters:**
- `period`: 'day', 'week', or 'month' (default: 'week')

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "period": "week",
  "totalEntries": 21,
  "totals": {
    "calories": 14500,
    "protein": 850,
    "carbs": 1200,
    "fat": 450
  },
  "averages": {
    "calories": 690,
    "protein": 40.5,
    "carbs": 57,
    "fat": 21.4
  },
  "logs": [...]
}
```

## Meal Types

Valid meal type values:
- `breakfast`
- `lunch`
- `dinner`
- `snack`

## Data Validation

All DTOs use class-validator for validation:
- `foodName`: Required string
- `calories`: Required number
- `protein`, `carbs`, `fat`: Required numbers (default 0)
- `servingSize`: Required number
- `servingUnit`: Required string
- `mealType`: Optional enum (breakfast/lunch/dinner/snack)
- `notes`: Optional string

## Business Logic

The service implements:
- Date-based filtering with proper timezone handling
- Automatic user ID association from JWT token
- Statistical calculations (totals and averages)
- Cascading deletes (via Prisma relations)

## Security

- All endpoints require JWT authentication
- Users can only access their own food logs
- User ID is extracted from JWT token, not request body
- Prisma handles SQL injection prevention

## Future Improvements

- [ ] Add batch creation for multiple food items
- [ ] Implement food log templates
- [ ] Add portion size calculator
- [ ] Integration with fitness goals for recommendations
- [ ] Export logs to CSV/PDF
