import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { searchFoods, getNutritionDetails } from '../lib/nutritionix';
import { MealType } from '../types';

export default function ManualEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');

    try {
      const results = await searchFoods(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setError('Failed to search foods. Please check your API credentials.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = async (food: any) => {
    setLoading(true);
    setError('');

    try {
      const details = await getNutritionDetails(food.food_name);
      setSelectedFood(details);
      setSearchResults([]);
    } catch (err: any) {
      setError('Failed to get food details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFood) return;

    setLoading(true);
    setError('');

    try {
      const { error: logError } = await supabase.from('food_logs').insert({
        user_id: user.id,
        food_name: selectedFood.food_name,
        meal_type: mealType,
        servings,
        calories: selectedFood.nf_calories * servings,
        protein: selectedFood.nf_protein * servings,
        carbs: selectedFood.nf_total_carbohydrate * servings,
        fats: selectedFood.nf_total_fat * servings,
        fiber: selectedFood.nf_dietary_fiber * servings,
        sugar: selectedFood.nf_sugars * servings,
        sodium: selectedFood.nf_sodium * servings,
        notes,
      });

      if (logError) throw logError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Food Logged Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {!selectedFood ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search for food
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., chicken breast, apple, pasta..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Search Results:</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {food.food_name}
                        </p>
                        {food.brand_name && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {food.brand_name}
                          </p>
                        )}
                      </div>
                      {food.nf_calories && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(food.nf_calories)} cal
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {selectedFood.food_name}
            </h3>
            {selectedFood.brand_name && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {selectedFood.brand_name}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Calories</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(selectedFood.nf_calories * servings)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Protein</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(selectedFood.nf_protein * servings)}g
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(selectedFood.nf_total_carbohydrate * servings)}g
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Fats</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(selectedFood.nf_total_fat * servings)}g
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFood(null)}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Choose different food
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Servings
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={servings}
              onChange={(e) => setServings(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meal Type
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Any additional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Logging Food...' : 'Log Food'}
          </button>
        </form>
      )}
    </div>
  );
}
