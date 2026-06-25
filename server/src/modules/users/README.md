# Users Module

Manages user profiles, settings, and statistics.

## Structure

```
users/
├── dto/
│   ├── create-user.dto.ts  # User creation validation
│   └── update-user.dto.ts  # User update validation
├── users.controller.ts      # User endpoints
├── users.module.ts          # Module definition
└── users.service.ts         # User business logic
```

## Features

- User profile management
- Body stats tracking (age, height, weight)
- Activity level and fitness goals
- User statistics and progress tracking
- Secure password handling

## Endpoints

### GET /api/users/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "age": 25,
  "height": 175,
  "weight": 70,
  "gender": "male",
  "activityLevel": "moderate",
  "goals": "Build muscle and lose fat",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

### PUT /api/users/me
Update current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "age": 26,
  "height": 175,
  "weight": 68,
  "activityLevel": "active",
  "goals": "Maintain current physique"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Smith",
  "age": 26,
  "height": 175,
  "weight": 68,
  "gender": "male",
  "activityLevel": "active",
  "goals": "Maintain current physique",
  "updatedAt": "2024-01-15T14:00:00Z"
}
```

### GET /api/users/stats
Get user daily statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "today": {
    "calories": 1850,
    "protein": 120,
    "carbs": 180,
    "fat": 65,
    "entries": 4
  }
}
```

## User Fields

### Required Fields
- `email`: Unique email address
- `password`: Hashed password (minimum 6 characters)
- `name`: User's full name

### Optional Fields
- `age`: User's age in years
- `height`: Height in cm or inches
- `weight`: Weight in kg or lbs
- `gender`: 'male', 'female', or 'other'
- `activityLevel`: 'sedentary', 'light', 'moderate', 'active', 'very_active'
- `goals`: Text description of fitness goals

## Activity Levels

Valid activity level values and their typical meanings:
- `sedentary` - Little or no exercise
- `light` - Light exercise 1-3 days/week
- `moderate` - Moderate exercise 3-5 days/week
- `active` - Hard exercise 6-7 days/week
- `very_active` - Very hard exercise & physical job

## Gender Options

Valid gender values:
- `male`
- `female`
- `other`

## Data Validation

The module uses class-validator for request validation:
- Email format validation
- Password strength (minimum 6 characters)
- Numeric validation for age, height, weight
- Enum validation for gender and activity level

## Security

- Passwords are never returned in responses
- User can only access/update their own profile
- JWT authentication required for all endpoints
- Email uniqueness enforced at database level

## Business Logic

### User Creation
1. Validates input data
2. Checks for existing email
3. Hashes password with bcrypt
4. Creates user record
5. Returns user without password

### User Update
1. Verifies user exists
2. Updates only provided fields
3. Automatically updates `updatedAt` timestamp
4. Returns updated profile without password

### Statistics Calculation
1. Fetches today's food logs
2. Calculates total macros
3. Counts number of entries
4. Returns aggregated data

## Database Relations

User model has relations to:
- `BodyStats` - Historical body measurements
- `FitnessGoal` - User's fitness goals
- `FoodLog` - User's food entries
- `FoodImage` - Uploaded food images

## Future Improvements

- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add profile picture upload
- [ ] Weekly/monthly stats endpoints
- [ ] User preferences and settings
- [ ] Account deletion with data export
