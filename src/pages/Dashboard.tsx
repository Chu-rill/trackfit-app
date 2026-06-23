import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BodyStats, FoodLog } from '../types';
import { formatWeight, formatHeight, getBMICategory } from '../utils/calculations';
import { format, startOfDay, endOfDay } from 'date-fns';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [bodyStats, setBodyStats] = useState<BodyStats | null>(null);
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch latest body stats
      const { data: stats } = await supabase
        .from('body_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

      if (stats) setBodyStats(stats);

      // Fetch today's food logs
      const today = new Date();
      const { data: logs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay(today).toISOString())
        .lte('logged_at', endOfDay(today).toISOString())
        .order('logged_at', { ascending: false });

      if (logs) setTodayLogs(logs);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const todayCarbs = todayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const todayFats = todayLogs.reduce((sum, log) => sum + (log.fats || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {!bodyStats && (
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Complete your profile to get personalized calorie and nutrition recommendations.{' '}
                <Link to="/profile-setup" className="font-medium underline">
                  Set up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {bodyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {formatWeight(bodyStats.weight, profile?.unit_preference || 'metric')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">BMI</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {bodyStats.bmi?.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {bodyStats.bmi && getBMICategory(bodyStats.bmi)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Maintenance Calories
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {bodyStats.maintenance_calories}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">cal/day</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Height</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {formatHeight(bodyStats.height, profile?.unit_preference || 'metric')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Today's Nutrition
              </h2>
              <Link
                to="/log-food"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Log Food
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(todayCalories)}
                  {bodyStats?.maintenance_calories && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {' '}/ {bodyStats.maintenance_calories}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(todayProtein)}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(todayCarbs)}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fats</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {Math.round(todayFats)}g
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Meals</h2>
          </div>
          <div className="p-6">
            {todayLogs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No meals logged today. Start tracking your nutrition!
              </p>
            ) : (
              <div className="space-y-4">
                {todayLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{log.food_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {log.meal_type && (
                          <span className="capitalize">{log.meal_type.replace('_', ' ')}</span>
                        )}
                        {' • '}
                        {format(new Date(log.logged_at), 'h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {Math.round(log.calories)} cal
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        P: {Math.round(log.protein || 0)}g C: {Math.round(log.carbs || 0)}g F:{' '}
                        {Math.round(log.fats || 0)}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/log-food"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">Log Food</h3>
          <p className="text-indigo-100">Track your meals and nutrition</p>
        </Link>

        <Link
          to="/reports"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">View Reports</h3>
          <p className="text-purple-100">See your weekly and monthly progress</p>
        </Link>

        <Link
          to="/goals"
          className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-lg p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">Set Goals</h3>
          <p className="text-pink-100">Define and track your fitness goals</p>
        </Link>
      </div>
    </div>
  );
}
