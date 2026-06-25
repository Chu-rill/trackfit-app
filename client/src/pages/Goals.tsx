import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { FitnessGoal, BodyStats, GoalType } from "../types";
import { calculateMacros } from "../utils/calculations";

export default function Goals() {
  const { user, profile } = useAuth();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [bodyStats, setBodyStats] = useState<BodyStats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    goal_type: "maintain_weight" as GoalType,
    target_weight: "",
    target_calories: "",
    target_date: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data: goalsData } = await supabase
        .from("fitness_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (goalsData) setGoals(goalsData);

      const { data: stats } = await supabase
        .from("body_stats")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false })
        .limit(1)
        .single();

      if (stats) {
        setBodyStats(stats);
        if (!formData.target_calories && stats.maintenance_calories) {
          setFormData((prev) => ({
            ...prev,
            target_calories: stats.maintenance_calories.toString(),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      // Deactivate previous goals
      await supabase
        .from("fitness_goals")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const targetCalories = parseInt(formData.target_calories);
      const macros = calculateMacros(targetCalories, formData.goal_type);

      const { error: insertError } = await supabase
        .from("fitness_goals")
        .insert({
          user_id: user.id,
          goal_type: formData.goal_type,
          target_weight: formData.target_weight
            ? parseFloat(formData.target_weight)
            : null,
          target_calories: targetCalories,
          target_protein: macros.protein,
          target_carbs: macros.carbs,
          target_fats: macros.fats,
          target_date: formData.target_date || null,
          is_active: true,
        });

      if (insertError) throw insertError;

      await fetchData();
      setShowForm(false);
      setFormData({
        goal_type: "maintain_weight",
        target_weight: "",
        target_calories: bodyStats?.maintenance_calories?.toString() || "",
        target_date: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to save goal");
    } finally {
      setSaving(false);
    }
  };

  const activeGoal = goals.find((g) => g.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Fitness Goals
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Set and track your nutrition and fitness goals
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {activeGoal && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Current Goal</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-indigo-100">Goal Type:</span>
              <span className="font-semibold capitalize">
                {activeGoal.goal_type.replace("_", " ")}
              </span>
            </div>
            {activeGoal.target_weight && (
              <div className="flex justify-between items-center">
                <span className="text-indigo-100">Target Weight:</span>
                <span className="font-semibold">
                  {activeGoal.target_weight}{" "}
                  {profile?.unit_preference === "metric" ? "kg" : "lbs"}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-indigo-100">Target Calories:</span>
              <span className="font-semibold">
                {activeGoal.target_calories} cal/day
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-indigo-400">
              <div>
                <p className="text-indigo-100 text-sm">Protein</p>
                <p className="text-2xl font-bold">
                  {activeGoal.target_protein}g
                </p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Carbs</p>
                <p className="text-2xl font-bold">{activeGoal.target_carbs}g</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Fats</p>
                <p className="text-2xl font-bold">{activeGoal.target_fats}g</p>
              </div>
            </div>
            {activeGoal.target_date && (
              <div className="flex justify-between items-center pt-4 border-t border-indigo-400">
                <span className="text-indigo-100">Target Date:</span>
                <span className="font-semibold">
                  {new Date(activeGoal.target_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!showForm ? (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            {activeGoal ? "Update Goal" : "Set New Goal"}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {activeGoal ? "Update Your Goal" : "Create New Goal"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Type
              </label>
              <select
                value={formData.goal_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goal_type: e.target.value as GoalType,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="lose_weight">Lose Weight</option>
                <option value="gain_weight">Gain Weight</option>
                <option value="maintain_weight">Maintain Weight</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Weight (optional) -{" "}
                {profile?.unit_preference === "metric" ? "kg" : "lbs"}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.target_weight}
                onChange={(e) =>
                  setFormData({ ...formData, target_weight: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder={bodyStats?.weight.toString() || "70"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily Calorie Target
              </label>
              <input
                type="number"
                required
                value={formData.target_calories}
                onChange={(e) =>
                  setFormData({ ...formData, target_calories: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              {bodyStats?.maintenance_calories && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your maintenance: {bodyStats.maintenance_calories} cal/day
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Date (optional)
              </label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) =>
                  setFormData({ ...formData, target_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {formData.target_calories && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Recommended Macros
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const macros = calculateMacros(
                      parseInt(formData.target_calories),
                      formData.goal_type,
                    );
                    return (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Protein
                          </p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">
                            {macros.protein}g
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Carbs
                          </p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">
                            {macros.carbs}g
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Fats
                          </p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">
                            {macros.fats}g
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
              >
                {saving ? "Saving..." : "Save Goal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {goals.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Goal History
          </h2>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {goal.goal_type.replace("_", " ")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {goal.target_calories} cal/day • Started{" "}
                    {new Date(goal.start_date).toLocaleDateString()}
                  </p>
                </div>
                {goal.is_active && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
