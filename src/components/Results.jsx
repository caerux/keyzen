import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Results = ({
  wpm,
  accuracy,
  correctChars,
  incorrectChars,
  timeElapsed,
  onRestart,
  onReset,
  wpmHistory,
  typedWords = [],
  totalWords = 0,
  testDuration = 60,
  consistency = 100,
}) => {
  // Chart data for WPM progression - limit to test duration
  const chartLabels = Array.from(
    { length: testDuration },
    (_, index) => `${index + 1}s`
  );
  const chartWpmData = Array.from({ length: testDuration }, (_, index) =>
    wpmHistory[index] !== undefined
      ? wpmHistory[index]
      : index === 0
      ? 0
      : wpmHistory[wpmHistory.length - 1] || 0
  );

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "WPM",
        data: chartWpmData,
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

  const totalChars = correctChars + incorrectChars;

  // Calculate word-level statistics
  const correctWords = typedWords.filter((word) => word.correct).length;
  const wordAccuracy =
    totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Results Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Test Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here are your typing statistics
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{wpm}</div>
            <div className="text-blue-100">WPM</div>
            <div className="text-sm text-blue-200 mt-1">Words Per Minute</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{accuracy}%</div>
            <div className="text-green-100">Accuracy</div>
            <div className="text-sm text-green-200 mt-1">
              {correctChars}/{totalChars} chars
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {correctChars}/{incorrectChars}
            </div>
            <div className="text-purple-100">Characters</div>
            <div className="text-sm text-purple-200 mt-1">
              Correct/Incorrect
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{consistency}%</div>
            <div className="text-indigo-100">Consistency</div>
            <div className="text-sm text-indigo-200 mt-1">Higher is better</div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Detailed Statistics</h3>

        {/* Character Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {correctChars}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct Characters
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {incorrectChars}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Incorrect Characters
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{totalChars}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Characters
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {totalWords}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Words Attempted
            </div>
          </div>
        </div>

        {/* Word Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {correctWords}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct Words
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {totalWords - correctWords}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Incorrect Words
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {wordAccuracy}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Word Accuracy
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-500">
              {wpmHistory.length > 1 ? Math.max(...wpmHistory) : wpm}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Peak WPM
            </div>
          </div>
        </div>
      </div>

      {/* WPM Chart */}
      {wpmHistory.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white">
              📈 WPM Over Time
            </h3>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
        >
          New Test
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          Try Again
        </button>
      </div>

      {/* Keyboard Shortcuts Reminder */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        <span className="mr-4">Tab or Ctrl+R: Try Again</span>
        <span>Esc: New Test</span>
      </div>
    </div>
  );
};

export default Results;
