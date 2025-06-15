import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  getUserAnalytics,
  getRecentTests,
  getProgressData,
  exportUserData,
  clearUserData,
} from "../utils/analytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = ({ onClose }) => {
  const [userData, setUserData] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [selectedMetric, setSelectedMetric] = useState("averageWpm");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = () => {
    const analytics = getUserAnalytics();
    const recent = getRecentTests(10);
    const progress = getProgressData(selectedPeriod, 30);

    setUserData(analytics);
    setRecentTests(recent);
    setProgressData(progress);
  };

  const handleExportData = () => {
    const exportData = exportUserData();
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `keyzen-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    setShowClearConfirm(true);
  };

  const confirmClearData = () => {
    clearUserData();
    loadAnalyticsData();
    setShowClearConfirm(false);
  };

  const cancelClearData = () => {
    setShowClearConfirm(false);
  };

  if (!userData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  // Chart data for progress over time
  const chartData = {
    labels: progressData.map((item) => {
      if (selectedPeriod === "daily") {
        return new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else if (selectedPeriod === "weekly") {
        return item.date;
      } else {
        return new Date(item.date + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      }
    }),
    datasets: [
      {
        label:
          selectedMetric === "averageWpm"
            ? "Average WPM"
            : selectedMetric === "bestWpm"
            ? "Best WPM"
            : "Average Accuracy",
        data: progressData.map((item) => item[selectedMetric] || 0),
        borderColor: "#fbbf24",
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#fbbf24",
        pointBorderColor: "#fbbf24",
        pointRadius: 4,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 12 },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 12 },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 8,
        backgroundColor: "#fbbf24",
        borderColor: "#fbbf24",
        borderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
    },
  };

  // Test distribution chart
  const testDistributionData = {
    labels: ["15s", "30s", "60s", "120s"],
    datasets: [
      {
        label: "Tests",
        data: [15, 30, 60, 120].map(
          (duration) =>
            userData.testHistory.filter(
              (test) => test.testConfig.duration === duration
            ).length
        ),
        backgroundColor: ["#ef4444", "#f97316", "#10b981", "#3b82f6"],
      },
    ],
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Analytics & Progress</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Personal Bests */}
          <div>
            <h3 className="text-xl font-semibold mb-6">🏆 Personal Bests</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {userData.personalBests.wpm.value}
                  </div>
                  <div className="text-blue-100 text-lg font-medium">WPM</div>
                  <div className="text-sm text-blue-200 mt-2">
                    {userData.personalBests.wpm.date
                      ? formatDate(userData.personalBests.wpm.date)
                      : "No data yet"}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {userData.personalBests.accuracy.value}%
                  </div>
                  <div className="text-green-100 text-lg font-medium">
                    Accuracy
                  </div>
                  <div className="text-sm text-green-200 mt-2">
                    {userData.personalBests.accuracy.date
                      ? formatDate(userData.personalBests.accuracy.date)
                      : "No data yet"}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {userData.personalBests.consistency.value === Infinity
                      ? "N/A"
                      : `${userData.personalBests.consistency.value}%`}
                  </div>
                  <div className="text-purple-100 text-lg font-medium">
                    Consistency
                  </div>
                  <div className="text-sm text-purple-200 mt-2">
                    Higher is better
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Statistics */}
          <div>
            <h3 className="text-xl font-semibold mb-6">
              📊 Overall Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {userData.statistics.totalTests}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Total Tests
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {formatTime(userData.statistics.totalTimeTyping)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Time Typing
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-purple-500 mb-2">
                  {userData.statistics.averageWpm}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Average WPM
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {userData.statistics.averageAccuracy}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Average Accuracy
                </div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          {progressData.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-white">
                  📈 Progress Over Time
                </h3>
                <div className="flex gap-3">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white text-sm font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="averageWpm">Average WPM</option>
                    <option value="bestWpm">Best WPM</option>
                    <option value="averageAccuracy">Average Accuracy</option>
                  </select>
                </div>
              </div>
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Test Distribution and Recent Tests */}
          {userData.testHistory.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6">
                  ⏱️ Test Duration Distribution
                </h3>
                <div className="h-64">
                  <Bar
                    data={testDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          titleColor: "white",
                          bodyColor: "white",
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1, color: "#6b7280" },
                          grid: { color: "#e5e7eb" },
                        },
                        x: {
                          ticks: { color: "#6b7280" },
                          grid: { color: "#e5e7eb" },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Recent Tests */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6">🕒 Recent Tests</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentTests.map((test, index) => (
                    <div
                      key={test.id}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {test.performance.wpm} WPM •{" "}
                            {test.performance.accuracy}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {test.testConfig.mode} • {test.testConfig.duration}s
                            • {formatDate(test.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {test.details.peakWpm} peak
                        </div>
                        <div className="text-xs text-gray-500">
                          {test.performance.totalWords} words
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6">🔧 Data Management</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
              >
                <span>📥</span>
                Export Data
              </button>
              <button
                onClick={handleClearData}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
              >
                <span>🗑️</span>
                Clear All Data
              </button>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Tip:</strong> Export your data for backup or to
                import into another device. Clear all data will permanently
                delete your progress - this action cannot be undone.
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {userData.testHistory.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-gray-500 dark:text-gray-400 text-xl font-medium mb-2">
                No test data available yet
              </div>
              <div className="text-gray-400 dark:text-gray-500 mb-6">
                Complete some typing tests to see your analytics and progress!
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium">
                <span>🚀</span>
                Start your first test to see analytics
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Data stored locally in your browser
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md mx-4 transform scale-100 transition-all">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Clear All Data?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                This will permanently delete all your typing test data,
                including:
              </p>
              <div className="text-left bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>• All test results and history</li>
                  <li>• Personal best records</li>
                  <li>• Progress charts and statistics</li>
                  <li>• Analytics data</li>
                </ul>
              </div>
              <p className="text-red-600 dark:text-red-400 font-semibold mb-6">
                This action cannot be undone!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelClearData}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearData}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
                >
                  Yes, Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
