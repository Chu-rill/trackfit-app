import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { searchByBarcode } from "../lib/nutritionix";
import type { MealType } from "../types";
import { useNavigate } from "react-router-dom";

export default function QRScanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanner]);

  const startScanning = () => {
    setScanning(true);
    setError("");

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false,
    );

    html5QrcodeScanner.render(
      async (decodedText) => {
        setScannedCode(decodedText);
        setScanning(false);
        html5QrcodeScanner.clear();

        // Search for food by barcode
        setLoading(true);
        try {
          const food = await searchByBarcode(decodedText);
          setSelectedFood(food);
        } catch (err: any) {
          setError(
            "Food not found for this barcode. Try entering it manually.",
          );
        } finally {
          setLoading(false);
        }
      },
      (errorMessage) => {
        // Scanner errors are normal, just ignore
      },
    );

    setScanner(html5QrcodeScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  const handleManualEntry = async () => {
    if (!scannedCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const food = await searchByBarcode(scannedCode);
      setSelectedFood(food);
    } catch (err: any) {
      setError("Food not found for this barcode");
    } finally {
      setLoading(false);
    }
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

      {!scanning && !selectedFood && (
        <div>
          <div className="text-center mb-6">
            <button
              onClick={startScanning}
              className="w-full py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            >
              <div className="text-6xl mb-4">📱</div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Scan QR/Barcode
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Scan the barcode on your food packaging
              </p>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or enter manually
              </span>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Barcode Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Enter barcode number..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleManualEntry}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
      )}

      {scanning && (
        <div>
          <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
          <button
            onClick={stopScanning}
            className="w-full mt-4 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Cancel Scanning
          </button>
        </div>
      )}

      {selectedFood && (
        <div className="space-y-6">
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
            <button
              onClick={() => {
                setSelectedFood(null);
                setScannedCode("");
              }}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Scan different item
            </button>
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

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Logging..." : "Log Food"}
          </button>
        </div>
      )}
    </div>
  );
}
