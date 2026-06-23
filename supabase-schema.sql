-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Body Stats Table
CREATE TABLE IF NOT EXISTS body_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  weight DECIMAL(6, 2) NOT NULL, -- in kg or lbs depending on user preference
  height DECIMAL(6, 2) NOT NULL, -- in cm or inches
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  bmi DECIMAL(5, 2),
  maintenance_calories INTEGER,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Fitness Goals Table
CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle', 'general_fitness')),
  target_weight DECIMAL(6, 2),
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fats INTEGER,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Food Items Table (cached nutrition data)
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_name TEXT NOT NULL,
  brand_name TEXT,
  serving_size TEXT,
  serving_unit TEXT,
  serving_weight_grams DECIMAL(8, 2),
  calories DECIMAL(8, 2) NOT NULL,
  protein DECIMAL(8, 2),
  carbs DECIMAL(8, 2),
  fats DECIMAL(8, 2),
  fiber DECIMAL(8, 2),
  sugar DECIMAL(8, 2),
  sodium DECIMAL(8, 2),
  cholesterol DECIMAL(8, 2),
  saturated_fat DECIMAL(8, 2),
  nutritionix_id TEXT,
  barcode TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Food Log Table
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES food_items(id),
  food_name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings DECIMAL(6, 2) DEFAULT 1,
  calories DECIMAL(8, 2) NOT NULL,
  protein DECIMAL(8, 2),
  carbs DECIMAL(8, 2),
  fats DECIMAL(8, 2),
  fiber DECIMAL(8, 2),
  sugar DECIMAL(8, 2),
  sodium DECIMAL(8, 2),
  image_url TEXT,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Food Images Table
CREATE TABLE IF NOT EXISTS food_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  food_log_id UUID REFERENCES food_logs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_body_stats_user_id ON body_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_body_stats_measured_at ON body_stats(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_active ON fitness_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_logged_at ON food_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_items_barcode ON food_items(barcode);
CREATE INDEX IF NOT EXISTS idx_food_items_nutritionix_id ON food_items(nutritionix_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Body Stats Policies
CREATE POLICY "Users can view own body stats" ON body_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body stats" ON body_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body stats" ON body_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own body stats" ON body_stats
  FOR DELETE USING (auth.uid() = user_id);

-- Fitness Goals Policies
CREATE POLICY "Users can view own goals" ON fitness_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON fitness_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON fitness_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON fitness_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Food Logs Policies
CREATE POLICY "Users can view own food logs" ON food_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs" ON food_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs" ON food_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs" ON food_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Food Images Policies
CREATE POLICY "Users can view own food images" ON food_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food images" ON food_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food images" ON food_images
  FOR DELETE USING (auth.uid() = user_id);

-- Food Items Policies (public read, authenticated write)
CREATE POLICY "Anyone can view food items" ON food_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert food items" ON food_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_goals_updated_at BEFORE UPDATE ON fitness_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Set up Storage Buckets (run this separately in Supabase Dashboard > Storage)
-- 1. Create a bucket called 'food-images'
-- 2. Set it to public if you want images accessible without auth
-- 3. Add storage policies:

/*
-- Storage Policies for food-images bucket
CREATE POLICY "Users can upload food images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own food images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own food images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);
*/
