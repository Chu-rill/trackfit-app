# TrackFit - Nutrition & Fitness Tracking App

A comprehensive fitness and nutrition tracking application built with React, TypeScript, NestJS, and PostgreSQL. Similar to MyFitnessPal, TrackFit helps users track their meals, monitor nutrition, and achieve their fitness goals.

## Project Structure

```
trackfit-app/
├── client/          # React + Vite frontend application
├── server/          # NestJS backend API with Prisma
├── .gitignore       # Root gitignore
└── README.md        # This file
```

## Features

### Authentication
- Secure user authentication with Supabase Auth
- Email/password signup and login
- Protected routes and user sessions

### Body Stats & Metrics
- Track weight, height, age, and activity level
- Automatic BMI calculation
- Maintenance calorie calculation using Mifflin-St Jeor equation
- Support for both metric (kg, cm) and imperial (lbs, inches) units
- Activity level multipliers for accurate TDEE

### Food Logging (Multiple Methods)
1. **Manual Entry**: Search Calorie API food database and manually log meals
2. **Image Upload**: Upload photos of meals, identify the food, and log nutrition
3. **Camera Capture**: Take photos directly in the app to log meals
4. **QR/Barcode Scanning**: Scan product barcodes for instant nutrition data

### Nutrition Tracking
- Comprehensive nutrition data (calories, protein, carbs, fats, fiber, sugar, sodium)
- Meal type categorization (breakfast, lunch, dinner, snack)
- Daily nutrition dashboard
- Visual progress indicators

### Reports & Analytics
- Weekly nutrition reports with daily breakdown
- Monthly reports with weekly averages
- Interactive charts using Recharts
- Macronutrient trends visualization
- Average daily nutrition statistics
- Personalized recommendations based on intake

### Goal Setting
- Multiple goal types (lose weight, gain weight, maintain weight, build muscle, general fitness)
- Custom calorie targets
- Automatic macro calculation based on goal type
- Target weight and date setting
- Goal history tracking
- Active goal monitoring

### Profile Management
- User profile with personal information
- Update body stats over time
- Unit preference settings

## Tech Stack

### Frontend (client/)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Routing**: React Router v7
- **Charts**: Recharts
- **Camera**: react-webcam
- **QR Scanning**: html5-qrcode
- **Date Handling**: date-fns
- **Form Validation**: React Hook Form + Zod

### Backend (server/)
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **External API**: Calorie API (BusyBody) for food data
- **Validation**: class-validator + class-transformer

## Setup Instructions

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

#### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

#### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with:
   - PostgreSQL DATABASE_URL
   - JWT_SECRET for authentication
   - CALORIE_API_KEY (get from https://calorieapi.com/auth/register)

5. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api`

#### Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with:
   - VITE_API_URL (default: http://localhost:3000/api)
   - Optional: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for file storage

5. Run the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Key Calculations

### BMI (Body Mass Index)
```
BMI = weight(kg) / (height(m))^2
```

### BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
```
Men: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

### TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × Activity Level Multiplier
```

Activity Multipliers:
- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
- Extremely Active: 1.9

### Macro Distribution by Goal
- **Build Muscle**: 35% protein, 40% carbs, 25% fats
- **Lose Weight**: 35% protein, 35% carbs, 30% fats
- **Maintain/General**: 30% protein, 45% carbs, 25% fats

## Database Schema

The app uses the following main tables:
- `user_profiles` - User information and preferences
- `body_stats` - Historical body measurements
- `fitness_goals` - User fitness goals
- `food_items` - Cached nutrition data
- `food_logs` - User meal logs
- `food_images` - Food photo references

All tables include Row Level Security (RLS) policies for data protection.

## License

MIT License - feel free to use this project for learning or commercial purposes.
