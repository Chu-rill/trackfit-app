import type { ActivityLevel, Gender, UnitPreference } from "../types";

// Activity level multipliers for maintenance calorie calculation
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

/**
 * Convert weight from pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

/**
 * Convert weight from kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

/**
 * Convert height from inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

/**
 * Convert height from centimeters to inches
 */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

/**
 * Calculate BMI (Body Mass Index)
 * BMI = weight(kg) / (height(m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
): number {
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === "male") {
    return Math.round(baseBMR + 5);
  } else if (gender === "female") {
    return Math.round(baseBMR - 161);
  } else {
    // For 'other', use average of male and female
    return Math.round((baseBMR + 5 + baseBMR - 161) / 2);
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE) / Maintenance Calories
 * TDEE = BMR × Activity Level Multiplier
 */
export function calculateMaintenanceCalories(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
): number {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Convert weight based on unit preference
 */
export function convertWeight(
  weight: number,
  from: UnitPreference,
  to: UnitPreference,
): number {
  if (from === to) return weight;

  if (from === "imperial" && to === "metric") {
    return lbsToKg(weight);
  } else {
    return kgToLbs(weight);
  }
}

/**
 * Convert height based on unit preference
 */
export function convertHeight(
  height: number,
  from: UnitPreference,
  to: UnitPreference,
): number {
  if (from === to) return height;

  if (from === "imperial" && to === "metric") {
    return inchesToCm(height);
  } else {
    return cmToInches(height);
  }
}

/**
 * Format weight with unit
 */
export function formatWeight(weight: number, unit: UnitPreference): string {
  const value = Math.round(weight * 10) / 10;
  return `${value} ${unit === "metric" ? "kg" : "lbs"}`;
}

/**
 * Format height with unit
 */
export function formatHeight(height: number, unit: UnitPreference): string {
  if (unit === "metric") {
    return `${Math.round(height)} cm`;
  } else {
    const totalInches = Math.round(height);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  }
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/**
 * Calculate recommended macros based on goal
 */
export function calculateMacros(
  calories: number,
  goalType: string,
): {
  protein: number;
  carbs: number;
  fats: number;
} {
  let proteinPercent = 0.3;
  let fatPercent = 0.25;
  let carbPercent = 0.45;

  // Adjust based on goal
  if (goalType === "build_muscle") {
    proteinPercent = 0.35;
    fatPercent = 0.25;
    carbPercent = 0.4;
  } else if (goalType === "lose_weight") {
    proteinPercent = 0.35;
    fatPercent = 0.3;
    carbPercent = 0.35;
  }

  return {
    protein: Math.round((calories * proteinPercent) / 4), // 4 calories per gram of protein
    carbs: Math.round((calories * carbPercent) / 4), // 4 calories per gram of carbs
    fats: Math.round((calories * fatPercent) / 9), // 9 calories per gram of fat
  };
}
