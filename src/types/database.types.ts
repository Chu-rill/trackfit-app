export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          unit_preference: 'metric' | 'imperial'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          unit_preference?: 'metric' | 'imperial'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          unit_preference?: 'metric' | 'imperial'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      body_stats: {
        Row: {
          id: string
          user_id: string
          weight: number
          height: number
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
          bmi: number | null
          maintenance_calories: number | null
          measured_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          height: number
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
          bmi?: number | null
          maintenance_calories?: number | null
          measured_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          height?: number
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
          bmi?: number | null
          maintenance_calories?: number | null
          measured_at?: string
          created_at?: string
        }
        Relationships: []
      }
      fitness_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle' | 'general_fitness'
          target_weight: number | null
          target_calories: number | null
          target_protein: number | null
          target_carbs: number | null
          target_fats: number | null
          start_date: string
          target_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle' | 'general_fitness'
          target_weight?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fats?: number | null
          start_date?: string
          target_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle' | 'general_fitness'
          target_weight?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fats?: number | null
          start_date?: string
          target_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          id: string
          food_name: string
          brand_name: string | null
          serving_size: string | null
          serving_unit: string | null
          serving_weight_grams: number | null
          calories: number
          protein: number | null
          carbs: number | null
          fats: number | null
          fiber: number | null
          sugar: number | null
          sodium: number | null
          cholesterol: number | null
          saturated_fat: number | null
          nutritionix_id: string | null
          barcode: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          food_name: string
          brand_name?: string | null
          serving_size?: string | null
          serving_unit?: string | null
          serving_weight_grams?: number | null
          calories: number
          protein?: number | null
          carbs?: number | null
          fats?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          cholesterol?: number | null
          saturated_fat?: number | null
          nutritionix_id?: string | null
          barcode?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          food_name?: string
          brand_name?: string | null
          serving_size?: string | null
          serving_unit?: string | null
          serving_weight_grams?: number | null
          calories?: number
          protein?: number | null
          carbs?: number | null
          fats?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          cholesterol?: number | null
          saturated_fat?: number | null
          nutritionix_id?: string | null
          barcode?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          food_item_id: string | null
          food_name: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          servings: number
          calories: number
          protein: number | null
          carbs: number | null
          fats: number | null
          fiber: number | null
          sugar: number | null
          sodium: number | null
          image_url: string | null
          notes: string | null
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_item_id?: string | null
          food_name: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          servings?: number
          calories: number
          protein?: number | null
          carbs?: number | null
          fats?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          image_url?: string | null
          notes?: string | null
          logged_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_item_id?: string | null
          food_name?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          servings?: number
          calories?: number
          protein?: number | null
          carbs?: number | null
          fats?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          image_url?: string | null
          notes?: string | null
          logged_at?: string
          created_at?: string
        }
        Relationships: []
      }
      food_images: {
        Row: {
          id: string
          user_id: string
          food_log_id: string | null
          image_url: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_log_id?: string | null
          image_url: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_log_id?: string | null
          image_url?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
