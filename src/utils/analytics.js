// Analytics and Progress Tracking System
// Designed to be compatible with future login functionality

/**
 * Data Structure Design:
 * - User-centric: All data organized by user (currently 'local_user')
 * - Database-ready: Uses proper IDs, timestamps, and normalized structure
 * - Migration-friendly: Can easily sync LocalStorage data to backend
 */

// Generate unique IDs for tests and sessions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get current user ID (for future login compatibility)
const getCurrentUserId = () => {
  // For now, use 'local_user' - will be replaced with actual user ID after login
  return "local_user";
};

/**
 * Test Result Data Structure
 */
const createTestResult = ({
  wpm,
  accuracy,
  correctChars,
  incorrectChars,
  timeElapsed,
  testDuration,
  testMode,
  customText = null,
  wpmHistory = [],
  typedWords = [],
  totalWords = 0,
}) => {
  return {
    id: generateId(),
    userId: getCurrentUserId(),
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD for easy grouping

    // Test Configuration
    testConfig: {
      mode: testMode, // 'words' or 'custom'
      duration: testDuration,
      customText: testMode === "custom" ? customText : null,
      textLength: testMode === "custom" ? customText?.length : null,
    },

    // Performance Metrics
    performance: {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars: correctChars + incorrectChars,
      timeElapsed,
      totalWords,
      completionRate:
        totalWords > 0
          ? Math.round(
              (totalWords / (customText ? customText.split(" ").length : 100)) *
                100
            )
          : 0,
    },

    // Detailed Data
    details: {
      wpmHistory,
      typedWords,
      peakWpm: wpmHistory.length > 0 ? Math.max(...wpmHistory) : wpm,
      averageWpm:
        wpmHistory.length > 0
          ? Math.round(
              wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length
            )
          : wpm,
      consistency: calculateConsistency(wpmHistory),
    },

    // Metadata
    metadata: {
      version: "1.0",
      platform: "web",
      userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
    },
  };
};

/**
 * Calculate typing consistency (higher is better, 0-100 scale)
 */
const calculateConsistency = (wpmHistory) => {
  if (wpmHistory.length < 2) return 100;

  const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
  if (mean === 0) return 100;

  const variance =
    wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) /
    wpmHistory.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / mean;

  // Map coefficient of variation to 0-100 scale (lower CV = higher consistency)
  const consistency = Math.max(0, 100 - coefficientOfVariation * 100);
  return Math.round(consistency);
};

/**
 * Save test result to LocalStorage
 */
export const saveTestResult = (testData) => {
  try {
    const result = createTestResult(testData);
    const userId = getCurrentUserId();

    // Get existing user data
    const userData = getUserData(userId);

    // Add new test result
    userData.testHistory.push(result);

    // Update personal bests
    updatePersonalBests(userData, result);

    // Update statistics
    updateUserStatistics(userData);

    // Save back to localStorage
    saveUserData(userId, userData);

    return result;
  } catch (error) {
    console.error("Error saving test result:", error);
    return null;
  }
};

/**
 * Get user data structure (creates if doesn't exist)
 */
const getUserData = (userId) => {
  try {
    const stored = localStorage.getItem(`typing_analytics_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }

  // Return default user data structure
  return {
    userId,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),

    // Personal Best Records
    personalBests: {
      wpm: { value: 0, testId: null, date: null },
      accuracy: { value: 0, testId: null, date: null },
      consistency: { value: 0, testId: null, date: null }, // Higher is better
      longestStreak: { value: 0, testId: null, date: null },
    },

    // Overall Statistics
    statistics: {
      totalTests: 0,
      totalTimeTyping: 0, // in seconds
      totalCharactersTyped: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      favoriteTestMode: "words",
      favoriteTestDuration: 60,
      improvementRate: 0, // WPM improvement over time
    },

    // Test History
    testHistory: [],

    // Daily/Weekly/Monthly aggregates (for charts)
    aggregates: {
      daily: {},
      weekly: {},
      monthly: {},
    },

    // Settings and Preferences
    preferences: {
      defaultTestMode: "words",
      defaultTestDuration: 60,
      theme: "light",
      customTexts: [], // Saved custom texts
    },
  };
};

/**
 * Save user data to LocalStorage
 */
const saveUserData = (userId, userData) => {
  try {
    userData.lastUpdated = new Date().toISOString();
    localStorage.setItem(
      `typing_analytics_${userId}`,
      JSON.stringify(userData)
    );
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

/**
 * Update personal best records
 */
const updatePersonalBests = (userData, testResult) => {
  const { performance, details, id, timestamp } = testResult;
  const date = timestamp.split("T")[0];

  // WPM Record
  if (performance.wpm > userData.personalBests.wpm.value) {
    userData.personalBests.wpm = {
      value: performance.wpm,
      testId: id,
      date,
    };
  }

  // Accuracy Record
  if (performance.accuracy > userData.personalBests.accuracy.value) {
    userData.personalBests.accuracy = {
      value: performance.accuracy,
      testId: id,
      date,
    };
  }

  // Consistency Record (higher is better)
  if (details.consistency > userData.personalBests.consistency.value) {
    userData.personalBests.consistency = {
      value: details.consistency,
      testId: id,
      date,
    };
  }
};

/**
 * Update user statistics
 */
const updateUserStatistics = (userData) => {
  const tests = userData.testHistory;
  if (tests.length === 0) return;

  const stats = userData.statistics;

  // Basic counts
  stats.totalTests = tests.length;
  stats.totalTimeTyping = tests.reduce(
    (sum, test) => sum + test.performance.timeElapsed,
    0
  );
  stats.totalCharactersTyped = tests.reduce(
    (sum, test) => sum + test.performance.totalChars,
    0
  );

  // Averages
  stats.averageWpm = Math.round(
    tests.reduce((sum, test) => sum + test.performance.wpm, 0) / tests.length
  );
  stats.averageAccuracy = Math.round(
    tests.reduce((sum, test) => sum + test.performance.accuracy, 0) /
      tests.length
  );

  // Most used settings
  const modes = tests.map((t) => t.testConfig.mode);
  const durations = tests.map((t) => t.testConfig.duration);

  stats.favoriteTestMode = getMostFrequent(modes);
  stats.favoriteTestDuration = getMostFrequent(durations);

  // Improvement rate (WPM improvement over last 10 tests vs first 10 tests)
  if (tests.length >= 20) {
    const first10 =
      tests.slice(0, 10).reduce((sum, test) => sum + test.performance.wpm, 0) /
      10;
    const last10 =
      tests.slice(-10).reduce((sum, test) => sum + test.performance.wpm, 0) /
      10;
    stats.improvementRate = Math.round((last10 - first10) * 100) / 100;
  }

  // Update daily/weekly/monthly aggregates
  updateAggregates(userData);
};

/**
 * Get most frequent value in array
 */
const getMostFrequent = (arr) => {
  const frequency = {};
  arr.forEach((item) => (frequency[item] = (frequency[item] || 0) + 1));
  return Object.keys(frequency).reduce((a, b) =>
    frequency[a] > frequency[b] ? a : b
  );
};

/**
 * Update daily/weekly/monthly aggregates for charts
 */
const updateAggregates = (userData) => {
  const tests = userData.testHistory;
  const aggregates = { daily: {}, weekly: {}, monthly: {} };

  tests.forEach((test) => {
    const date = test.date;
    const year = date.substring(0, 4);
    const month = date.substring(0, 7); // YYYY-MM
    const week = getWeekKey(date);

    // Daily aggregates
    if (!aggregates.daily[date]) {
      aggregates.daily[date] = {
        tests: 0,
        totalWpm: 0,
        totalAccuracy: 0,
        bestWpm: 0,
      };
    }
    const daily = aggregates.daily[date];
    daily.tests++;
    daily.totalWpm += test.performance.wpm;
    daily.totalAccuracy += test.performance.accuracy;
    daily.bestWpm = Math.max(daily.bestWpm, test.performance.wpm);
    daily.averageWpm = Math.round(daily.totalWpm / daily.tests);
    daily.averageAccuracy = Math.round(daily.totalAccuracy / daily.tests);

    // Weekly aggregates
    if (!aggregates.weekly[week]) {
      aggregates.weekly[week] = {
        tests: 0,
        totalWpm: 0,
        totalAccuracy: 0,
        bestWpm: 0,
      };
    }
    const weekly = aggregates.weekly[week];
    weekly.tests++;
    weekly.totalWpm += test.performance.wpm;
    weekly.totalAccuracy += test.performance.accuracy;
    weekly.bestWpm = Math.max(weekly.bestWpm, test.performance.wpm);
    weekly.averageWpm = Math.round(weekly.totalWpm / weekly.tests);
    weekly.averageAccuracy = Math.round(weekly.totalAccuracy / weekly.tests);

    // Monthly aggregates
    if (!aggregates.monthly[month]) {
      aggregates.monthly[month] = {
        tests: 0,
        totalWpm: 0,
        totalAccuracy: 0,
        bestWpm: 0,
      };
    }
    const monthly = aggregates.monthly[month];
    monthly.tests++;
    monthly.totalWpm += test.performance.wpm;
    monthly.totalAccuracy += test.performance.accuracy;
    monthly.bestWpm = Math.max(monthly.bestWpm, test.performance.wpm);
    monthly.averageWpm = Math.round(monthly.totalWpm / monthly.tests);
    monthly.averageAccuracy = Math.round(monthly.totalAccuracy / monthly.tests);
  });

  userData.aggregates = aggregates;
};

/**
 * Get week key for date (YYYY-WW format)
 */
const getWeekKey = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, "0")}`;
};

/**
 * Get week number of year
 */
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Get user analytics data
 */
export const getUserAnalytics = (userId = null) => {
  const id = userId || getCurrentUserId();
  return getUserData(id);
};

/**
 * Get recent test results
 */
export const getRecentTests = (limit = 10, userId = null) => {
  const userData = getUserAnalytics(userId);
  return userData.testHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Get progress data for charts
 */
export const getProgressData = (
  period = "daily",
  limit = 30,
  userId = null
) => {
  const userData = getUserAnalytics(userId);
  const aggregates = userData.aggregates[period] || {};

  const sortedKeys = Object.keys(aggregates).sort().slice(-limit);

  return sortedKeys.map((key) => ({
    date: key,
    ...aggregates[key],
  }));
};

/**
 * Export user data (for backup or migration)
 */
export const exportUserData = (userId = null) => {
  const id = userId || getCurrentUserId();
  const userData = getUserData(id);

  return {
    exportDate: new Date().toISOString(),
    version: "1.0",
    userData,
  };
};

/**
 * Import user data (for restore or migration)
 */
export const importUserData = (exportedData, userId = null) => {
  try {
    const id = userId || getCurrentUserId();
    const { userData } = exportedData;

    // Update user ID if different
    userData.userId = id;
    userData.lastUpdated = new Date().toISOString();

    saveUserData(id, userData);
    return true;
  } catch (error) {
    console.error("Error importing user data:", error);
    return false;
  }
};

/**
 * Clear all user data (for reset)
 */
export const clearUserData = (userId = null) => {
  try {
    const id = userId || getCurrentUserId();
    localStorage.removeItem(`typing_analytics_${id}`);
    return true;
  } catch (error) {
    console.error("Error clearing user data:", error);
    return false;
  }
};

/**
 * Migration helper for future login functionality
 * This will help transfer LocalStorage data to user account
 */
export const prepareDataForMigration = () => {
  const localData = getUserData("local_user");

  return {
    hasData: localData.testHistory.length > 0,
    testCount: localData.testHistory.length,
    dateRange:
      localData.testHistory.length > 0
        ? {
            first: localData.testHistory[0].date,
            last: localData.testHistory[localData.testHistory.length - 1].date,
          }
        : null,
    personalBests: localData.personalBests,
    exportData: exportUserData("local_user"),
  };
};
