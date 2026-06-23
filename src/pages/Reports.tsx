import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FoodLog } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subWeeks, subMonths } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { user, profile } = useAuth();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFats: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const now = new Date();

      // Fetch last 7 days
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);

      const { data: weekLogs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', weekStart.toISOString())
        .lte('logged_at', weekEnd.toISOString());

      // Fetch last 30 days
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const { data: monthLogs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', monthStart.toISOString())
        .lte('logged_at', monthEnd.toISOString());

      if (weekLogs) {
        processWeeklyData(weekLogs, weekStart, weekEnd);
      }

      if (monthLogs) {
        processMonthlyData(monthLogs, monthStart, monthEnd);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (logs: FoodLog[], start: Date, end: Date) => {
    const days = eachDayOfInterval({ start, end });
    const dailyData = days.map((day) => {
      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.logged_at);
        return format(logDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const calories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const protein = dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
      const carbs = dayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
      const fats = dayLogs.reduce((sum, log) => sum + (log.fats || 0), 0);

      return {
        date: format(day, 'EEE'),
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fats: Math.round(fats),
      };
    });

    setWeeklyData(dailyData);

    const totalDays = dailyData.filter((d) => d.calories > 0).length || 1;
    setWeeklyStats({
      avgCalories: Math.round(dailyData.reduce((sum, d) => sum + d.calories, 0) / totalDays),
      avgProtein: Math.round(dailyData.reduce((sum, d) => sum + d.protein, 0) / totalDays),
      avgCarbs: Math.round(dailyData.reduce((sum, d) => sum + d.carbs, 0) / totalDays),
      avgFats: Math.round(dailyData.reduce((sum, d) => sum + d.fats, 0) / totalDays),
    });
  };

  const processMonthlyData = (logs: FoodLog[], start: Date, end: Date) => {
    const days = eachDayOfInterval({ start, end });
    const weeklyData: any = {};

    days.forEach((day) => {
      const weekNum = Math.floor((day.getDate() - 1) / 7) + 1;
      const weekKey = `Week ${weekNum}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 };
      }

      const dayLogs = logs.filter((log) => {
        const logDate = new Date(log.logged_at);
        return format(logDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      if (dayLogs.length > 0) {
        weeklyData[weekKey].calories += dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        weeklyData[weekKey].protein += dayLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
        weeklyData[weekKey].carbs += dayLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
        weeklyData[weekKey].fats += dayLogs.reduce((sum, log) => sum + (log.fats || 0), 0);
        weeklyData[weekKey].count++;
      }
    });

    const chartData = Object.keys(weeklyData).map((week) => ({
      week,
      calories: Math.round(weeklyData[week].calories / (weeklyData[week].count || 1)),
      protein: Math.round(weeklyData[week].protein / (weeklyData[week].count || 1)),
      carbs: Math.round(weeklyData[week].carbs / (weeklyData[week].count || 1)),
      fats: Math.round(weeklyData[week].fats / (weeklyData[week].count || 1)),
    }));

    setMonthlyData(chartData);

    const daysWithData = logs.length > 0 ? new Set(logs.map((log) => format(new Date(log.logged_at), 'yyyy-MM-dd'))).size : 1;
    setMonthlyStats({
      avgCalories: Math.round(logs.reduce((sum, log) => sum + (log.calories || 0), 0) / daysWithData),
      avgProtein: Math.round(logs.reduce((sum, log) => sum + (log.protein || 0), 0) / daysWithData),
      avgCarbs: Math.round(logs.reduce((sum, log) => sum + (log.carbs || 0), 0) / daysWithData),
      avgFats: Math.round(logs.reduce((sum, log) => sum + (log.fats || 0), 0) / daysWithData),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading reports...</div>
      </div>
    );
  }

  const stats = view === 'week' ? weeklyStats : monthlyStats;
  const chartData = view === 'week' ? weeklyData : monthlyData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nutrition Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your progress and improve your nutrition
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('week')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === 'week'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setView('month')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === 'month'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Monthly
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Calories</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {stats.avgCalories}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Protein</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
            {stats.avgProtein}g
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Carbs</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
            {stats.avgCarbs}g
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Fats</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
            {stats.avgFats}g
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Calorie Trends
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={view === 'week' ? 'date' : 'week'} stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="calories" stroke="#6366F1" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Macronutrient Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={view === 'week' ? 'date' : 'week'} stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Legend />
            <Bar dataKey="protein" fill="#6366F1" />
            <Bar dataKey="carbs" fill="#10B981" />
            <Bar dataKey="fats" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Recommendations
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {stats.avgProtein < 50
                    ? 'Consider increasing protein intake for better muscle recovery'
                    : 'Great protein intake! Keep it up'}
                </li>
                <li>
                  {stats.avgCalories < 1200
                    ? 'Your calorie intake seems low. Consider eating more to meet your nutritional needs'
                    : stats.avgCalories > 3000
                    ? 'Your calorie intake is quite high. Review your portions if trying to lose weight'
                    : 'Your calorie intake looks balanced'}
                </li>
                <li>Try to maintain consistency in your daily nutrition tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
