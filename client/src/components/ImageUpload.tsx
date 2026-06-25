import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { searchFoods } from "../lib/nutritionix";
import type { MealType } from "../types";
import { useNavigate } from "react-router-dom";

export default function ImageUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [foodName, setFoodName] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "identify" | "confirm">("upload");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setError("");

    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("food-images").getPublicUrl(fileName);

      setUploadedUrl(publicUrl);
      setStep("identify");
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!foodName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const results = await searchFoods(foodName);
      setSearchResults(results);
    } catch (err: any) {
      setError("Failed to search foods");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!user || !selectedFood) return;

    setLoading(true);
    setError("");

    try {
      const { error: logError } = await supabase.from("food_logs").insert({
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

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {step === "upload" && (
        <div>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded"
                  />
                ) : (
                  <>
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG or JPEG (MAX. 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          )}
        </div>
      )}

      {step === "identify" && (
        <div>
          {preview && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Uploaded food"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What food is in this image?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g., chicken salad, pizza..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Select the food:
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {searchResults.map((food, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
        </div>
      )}

      {step === "confirm" && selectedFood && (
        <div className="space-y-6">
          {preview && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Uploaded food"
                className="w-full h-48 object-cover rounded-lg"
              />
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
                  {Math.round(
                    (selectedFood.nf_total_carbohydrate || 0) * servings,
                  )}
                  g
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
              onClick={() => setStep("identify")}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Logging..." : "Log Food"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
