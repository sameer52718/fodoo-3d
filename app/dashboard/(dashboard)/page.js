'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import handleError from '@/lib/handleError';
import { useSelector } from 'react-redux';

export default function DashboardHome() {
  const { user, userType } = useSelector(state => state.auth)
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/states');
        setStats(response.data.stats);
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format stat keys for display (e.g., "totalUsers" -> "Total Users")
  const formatStatKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto bg-gray-100">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Dashboard Overview {userType === "USER" && user?.name}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div
              key={key}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                {formatStatKey(key)}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-500 mt-2">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No statistics available at this time.
        </div>
      )}
    </div>
  );
}