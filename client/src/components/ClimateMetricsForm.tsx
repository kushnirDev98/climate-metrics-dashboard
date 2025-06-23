import React, { useState } from 'react';

interface ClimateMetricsFormProps {
    onSubmit: (city: string, startTime: string, endTime: string) => void;
    loading?: boolean;
}

export const ClimateMetricsForm: React.FC<ClimateMetricsFormProps> = ({ onSubmit, loading }) => {
    const [city, setCity] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(city.trim(), startTime, endTime);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow w-full max-w-md flex flex-col gap-4"
        >
            <div>
                <label htmlFor="city" className="block text-sm font-semibold mb-1">
                    City
                </label>
                <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input w-full"
                    placeholder="Enter city"
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="startTime" className="block text-sm font-semibold mb-1">
                    Start Time
                </label>
                <input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input w-full"
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="endTime" className="block text-sm font-semibold mb-1">
                    End Time
                </label>
                <input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input w-full"
                    required
                    disabled={loading}
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Loading...' : 'Fetch Metrics'}
            </button>
        </form>
    );
};
