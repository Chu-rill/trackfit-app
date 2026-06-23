# TrackFit - Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier is fine)
- Nutritionix API account (free tier available)

## 1. Supabase Setup

### Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: trackfit (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is fine to start
4. Wait for project to be created (~2 minutes)

### Get your API credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Set up the database schema

1. Go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the SQL schema from `supabase-schema.sql` (we'll create this next)
4. Click **Run** to execute the schema

## 2. Nutritionix API Setup

1. Go to [developer.nutritionix.com](https://developer.nutritionix.com/)
2. Sign up for a free account
3. Create a new application
4. Copy your **Application ID** and **API Key**

## 3. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_NUTRITIONIX_APP_ID=your_nutritionix_app_id
   VITE_NUTRITIONIX_API_KEY=your_nutritionix_api_key
   ```

## 4. Install Dependencies

```bash
npm install
```

## 5. Run the Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## Features

- **Authentication**: Sign up, login, logout with Supabase Auth
- **Body Stats Tracking**: Track weight, height, age, activity level
- **Calorie Calculator**: Automatic maintenance calorie calculation using Mifflin-St Jeor equation
- **Food Logging**:
  - Upload food images
  - Take photos with camera
  - Scan QR codes
  - Manual entry
- **Nutrition Tracking**: Track calories, protein, carbs, fats, and other nutrients
- **Reports**: Weekly and monthly nutrition reports
- **Goal Setting**: Set fitness goals and get recommendations
- **Unit Support**: Both metric (kg, cm) and imperial (lbs, inches) units

## Support

For issues or questions, please check the documentation or create an issue in the repository.
