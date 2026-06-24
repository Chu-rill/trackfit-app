# TrackFit - Nutrition & Fitness Tracking App

A comprehensive fitness and nutrition tracking application built with React, TypeScript, and Supabase. Similar to MyFitnessPal, TrackFit helps users track their meals, monitor nutrition, and achieve their fitness goals.

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

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Food Database**: Calorie API (BusyBody)
- **Charts**: Recharts
- **Camera**: react-webcam
- **QR Scanning**: html5-qrcode
- **Date Handling**: date-fns
- **Form Validation**: React Hook Form + Zod

## Setup Instructions

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CALORIE_API_KEY=your_calorie_api_key
   ```

   Get your Calorie API key at: https://calorieapi.com/auth/register

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in the SQL Editor
   - Create a storage bucket named `food-images`

4. Run the development server:
   ```bash
   npm run dev
   ```

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
