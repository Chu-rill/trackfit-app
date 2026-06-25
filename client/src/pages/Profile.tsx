import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type {
  Gender,
  UnitPreference,
  ActivityLevel,
  BodyStats,
} from "../types";
import {
  calculateBMI,
  calculateMaintenanceCalories,
  calculateAge,
} from "../utils/calculations";

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [bodyStats, setBodyStats] = useState<BodyStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    date_of_birth: profile?.date_of_birth || "",
    gender: (profile?.gender || "other") as Gender,
    unit_preference: (profile?.unit_preference || "metric") as UnitPreference,
  });

  const [statsData, setStatsData] = useState({
    weight: "",
    height: "",
    activity_level: "moderately_active" as ActivityLevel,
  });

  useEffect(() => {
    if (user) {
      fetchBodyStats();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "other",
        unit_preference: profile.unit_preference || "metric",
      });
    }
  }, [profile]);

  const fetchBodyStats = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("body_stats")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setBodyStats(data);
      setStatsData({
        weight: data.weight.toString(),
        height: data.height.toString(),
        activity_level: data.activity_level,
      });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");

    try {
      await updateProfile(profileData);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStats = async () => {
    if (!user || !profileData.date_of_birth || !profileData.gender) return;

    setSaving(true);
    setError("");

    try {
      const weightNum = parseFloat(statsData.weight);
      const heightNum = parseFloat(statsData.height);
      const age = calculateAge(profileData.date_of_birth);
      const bmi = calculateBMI(weightNum, heightNum);
      const maintenanceCalories = calculateMaintenanceCalories(
        weightNum,
        heightNum,
        age,
        profileData.gender,
        statsData.activity_level,
      );

      const { error: insertError } = await supabase.from("body_stats").insert({
        user_id: user.id,
        weight: weightNum,
        height: heightNum,
        activity_level: statsData.activity_level,
        bmi,
        maintenance_calories: maintenanceCalories,
      });

      if (insertError) throw insertError;

      await fetchBodyStats();
    } catch (err: any) {
      setError(err.message || "Failed to update stats");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal information and body stats
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.full_name}
              onChange={(e) =>
                setProfileData({ ...profileData, full_name: e.target.value })
              }
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={profileData.date_of_birth}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  date_of_birth: e.target.value,
                })
              }
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender
            </label>
            <select
              value={profileData.gender}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  gender: e.target.value as Gender,
                })
              }
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-700"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unit Preference
            </label>
            <select
              value={profileData.unit_preference}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  unit_preference: e.target.value as UnitPreference,
                })
              }
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-700"
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
            </select>
          </div>

          {editing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setEditing(false);
                  if (profile) {
                    setProfileData({
                      full_name: profile.full_name || "",
                      date_of_birth: profile.date_of_birth || "",
                      gender: profile.gender || "other",
                      unit_preference: profile.unit_preference || "metric",
                    });
                  }
                }}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Body Stats
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight ({profileData.unit_preference === "metric" ? "kg" : "lbs"})
            </label>
            <input
              type="number"
              step="0.1"
              value={statsData.weight}
              onChange={(e) =>
                setStatsData({ ...statsData, weight: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height (
              {profileData.unit_preference === "metric" ? "cm" : "inches"})
            </label>
            <input
              type="number"
              step="0.1"
              value={statsData.height}
              onChange={(e) =>
                setStatsData({ ...statsData, height: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Level
            </label>
            <select
              value={statsData.activity_level}
              onChange={(e) =>
                setStatsData({
                  ...statsData,
                  activity_level: e.target.value as ActivityLevel,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="sedentary">
                Sedentary (little or no exercise)
              </option>
              <option value="lightly_active">
                Lightly Active (1-3 days/week)
              </option>
              <option value="moderately_active">
                Moderately Active (3-5 days/week)
              </option>
              <option value="very_active">Very Active (6-7 days/week)</option>
              <option value="extremely_active">
                Extremely Active (physical job + exercise)
              </option>
            </select>
          </div>

          <button
            onClick={handleUpdateStats}
            disabled={saving}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {saving ? "Updating..." : "Update Body Stats"}
          </button>
        </div>

        {bodyStats && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Current Stats
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">BMI</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {bodyStats.bmi?.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Maintenance Calories
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {bodyStats.maintenance_calories} cal/day
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
