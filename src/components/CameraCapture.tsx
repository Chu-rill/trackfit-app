import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { searchFoods } from '../lib/nutritionix';
import { MealType } from '../types';
import { useNavigate } from 'react-router-dom';

export default function CameraCapture() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);

  const [imageSrc, setImageSrc] = useState<string>('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [foodName, setFoodName] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'capture' | 'identify' | 'confirm'>('capture');
  const [showCamera, setShowCamera] = useState(false);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setImageSrc(imageSrc);
    setShowCamera(false);
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not authenticated');

      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' });

      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { data, error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('food-images').getPublicUrl(fileName);

      setUploadedUrl(publicUrl);
      setStep('identify');
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  }, [webcamRef, user]);

  const handleSearch = async () => {
    if (!foodName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const results = await searchFoods(foodName);
      setSearchResults(results);
    } catch (err: any) {
      setError('Failed to search foods');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!user || !selectedFood) return;

    setLoading(true);
    setError('');

    try {
      const { error: logError } = await supabase.from('food_logs').insert({
        user_id: user.id,
        food_name: selectedFood.food_name,
        meal_type: mealType,
        servings,
        calories: (selectedFood.nf_calories || 0) * servings,
        protein: (selectedFood.nf_protein || 0) * servings,
        carbs: (selectedFood.nf_total_carbohydrate || 0) * servings,
        fats: (selectedFood.nf_total_fat || 0) * servings,
        fiber: (selectedFood.nf_dietary_fiber || 0) * servings,
        sugar: (selectedFood.nf_sugars || 0) * servings,
        sodium: (selectedFood.nf_sodium || 0) * servings,
        image_url: uploadedUrl,
      });

      if (logError) throw logError;

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setImageSrc('');
    setUploadedUrl('');
    setShowCamera(true);
    setStep('capture');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {step === 'capture' && (
        <div>
          {!showCamera && !imageSrc && (
            <div className="text-center">
              <button
                onClick={() => setShowCamera(true)}
                className="w-full py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
              >
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Open Camera</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Take a photo of your food
                </p>
              </button>
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full"
                  videoConstraints={{
                    facingMode: 'environment',
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCamera(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={capture}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Processing...' : 'Capture Photo'}
                </button>
              </div>
            </div>
          )}

          {imageSrc && !showCamera && (
            <div>
              <img src={imageSrc} alt="Captured" className="w-full rounded-lg mb-4" />
              <button
                onClick={retakePhoto}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Retake Photo
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'identify' && (
        <div>
          {imageSrc && (
            <div className="mb-4">
              <img src={imageSrc} alt="Captured food" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What food is in this photo?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., burger, salad..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Select the food:</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.map((food, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{food.food_name}</p>
                          {food.brand_name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{food.brand_name}</p>
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

            <button
              onClick={retakePhoto}
              className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              Retake Photo
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && selectedFood && (
        <div className="space-y-6">
          {imageSrc && (
            <div className="mb-4">
              <img src={imageSrc} alt="Captured food" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {selectedFood.food_name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Calories</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round((selectedFood.nf_calories || 0) * servings)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Protein</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round((selectedFood.nf_protein || 0) * servings)}g
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round((selectedFood.nf_total_carbohydrate || 0) * servings)}g
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Fats</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round((selectedFood.nf_total_fat || 0) * servings)}g
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Servings
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

          <div className="flex gap-3">
            <button
              onClick={() => setStep('identify')}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
