import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { ClimateMetricsChart } from './components/ClimateMetricsChart';
import { ErrorMessage } from './components/ErrorMessage';
import type { ClimateMetric } from './types';
import { fetchClimateMetrics } from './api/climateMetrics';

const App = () => {
    const [metricsData, setMetricsData] = useState<ClimateMetric[]>([]);
    const [chosenCity, setChosenCity] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { authToken } = useContext(AuthContext);

    const fetchMetrics = async (city: string) => {
        setChosenCity(city);
        setLoading(true);
        setError(null);

        try {
            const now = new Date();
            const startTime = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            const endTime = new Date(now.setHours(23, 59, 59, 999)).toISOString();
            const data = await fetchClimateMetrics(city, startTime, endTime, authToken);
            setMetricsData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch data when city changes
    useEffect(() => {
        if (chosenCity) {
            fetchMetrics(chosenCity);
        }
    }, [chosenCity, authToken]);

    const cities = {
        Berlin: 'Berlin',
        NewYork: 'NewYork',
        Tokyo: 'Tokyo',
        SaoPaulo: 'SaoPaulo',
        CapeTown: 'CapeTown',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-start p-6 gap-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Climate Metrics Dashboard
            </h1>
            <div className="w-full max-w-md">
                <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select City
                </label>
                <select
                    id="city-select"
                    value={chosenCity}
                    onChange={(e) => setChosenCity(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all duration-200 hover:border-indigo-300"
                    disabled={loading}
                >
                    <option value="">Select a city</option>
                    {Object.entries(cities).map(([key, city]) => (
                        <option key={key} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>
            {error && <ErrorMessage message={error} />}
            {chosenCity && !loading ? <ClimateMetricsChart city={chosenCity} data={metricsData} /> : null}
            {loading && (
                <div className="text-center text-blue-600 font-semibold">Loading data...</div>
            )}
        </div>
    );
};

export default App;