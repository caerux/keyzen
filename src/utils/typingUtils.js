// Typing calculation utilities

/**
 * Calculate Words Per Minute (WPM)
 * Standard calculation: 5 characters = 1 word
 */
export const calculateWPM = (correctChars, incorrectChars, timeElapsedMs) => {
  if (timeElapsedMs === 0) return 0;

  const minutes = timeElapsedMs / 1000 / 60;
  const totalChars = correctChars + incorrectChars;
  const wordsTyped = totalChars / 5; // Standard: 5 chars = 1 word

  return Math.round(wordsTyped / minutes) || 0;
};

/**
 * Calculate Net WPM (accounting for errors)
 * Net WPM = (Total characters typed / 5 - errors) / time in minutes
 */
export const calculateNetWPM = (
  correctChars,
  incorrectChars,
  timeElapsedMs
) => {
  if (timeElapsedMs === 0) return 0;

  const minutes = timeElapsedMs / 1000 / 60;
  const totalChars = correctChars + incorrectChars;
  const wordsTyped = totalChars / 5;
  const errors = incorrectChars;
  const netWords = Math.max(0, wordsTyped - errors);

  return Math.round(netWords / minutes) || 0;
};

/**
 * Calculate typing accuracy percentage
 */
export const calculateAccuracy = (correctChars, incorrectChars) => {
  const totalChars = correctChars + incorrectChars;
  if (totalChars === 0) return 100;

  return Math.round((correctChars / totalChars) * 100);
};

/**
 * Calculate word-level accuracy
 */
export const calculateWordAccuracy = (correctWords, totalWords) => {
  if (totalWords === 0) return 100;
  return Math.round((correctWords / totalWords) * 100);
};

/**
 * Analyze character-level differences between expected and typed text
 */
export const analyzeCharacterDifferences = (expected, typed) => {
  const result = {
    correct: 0,
    incorrect: 0,
    extra: 0,
    missing: 0,
    differences: [],
  };

  const maxLength = Math.max(expected.length, typed.length);

  for (let i = 0; i < maxLength; i++) {
    const expectedChar = expected[i];
    const typedChar = typed[i];

    if (expectedChar && typedChar) {
      if (expectedChar === typedChar) {
        result.correct++;
      } else {
        result.incorrect++;
        result.differences.push({
          position: i,
          expected: expectedChar,
          typed: typedChar,
          type: "substitution",
        });
      }
    } else if (expectedChar && !typedChar) {
      result.missing++;
      result.differences.push({
        position: i,
        expected: expectedChar,
        typed: null,
        type: "omission",
      });
    } else if (!expectedChar && typedChar) {
      result.extra++;
      result.differences.push({
        position: i,
        expected: null,
        typed: typedChar,
        type: "insertion",
      });
    }
  }

  return result;
};

/**
 * Check if backspace should be allowed based on current input state
 */
export const isBackspaceAllowed = (currentInput, hasCompletedCurrentWord) => {
  // Don't allow backspace if user has completed the current word (space typed)
  if (hasCompletedCurrentWord) return false;

  // Don't allow backspace if input contains space (would go to previous word)
  if (currentInput.includes(" ")) return false;

  return true;
};

/**
 * Validate input character
 */
export const isValidInputChar = (char) => {
  // Allow letters, numbers, common punctuation, and space
  const validChars = /^[a-zA-Z0-9\s.,;:!?'"()-]$/;
  return validChars.test(char);
};

/**
 * Generate typing statistics summary
 */
export const generateTypingStats = (testData) => {
  const { correctChars, incorrectChars, timeElapsed, typedWords, wpmHistory } =
    testData;

  const totalChars = correctChars + incorrectChars;
  const totalWords = typedWords.length;
  const correctWords = typedWords.filter((word) => word.correct).length;

  return {
    // Basic metrics
    wpm: calculateWPM(correctChars, incorrectChars, timeElapsed),
    netWPM: calculateNetWPM(correctChars, incorrectChars, timeElapsed),
    accuracy: calculateAccuracy(correctChars, incorrectChars),
    wordAccuracy: calculateWordAccuracy(correctWords, totalWords),

    // Character stats
    correctChars,
    incorrectChars,
    totalChars,

    // Word stats
    correctWords,
    incorrectWords: totalWords - correctWords,
    totalWords,

    // Performance stats
    peakWPM: wpmHistory.length > 0 ? Math.max(...wpmHistory) : 0,
    averageWPM:
      wpmHistory.length > 0
        ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
        : 0,

    // Time stats
    timeElapsed: Math.round(timeElapsed / 1000), // Convert to seconds

    // Consistency (standard deviation of WPM)
    wpmConsistency: calculateWPMConsistency(wpmHistory),
  };
};

/**
 * Calculate WPM consistency (lower is more consistent)
 */
export const calculateWPMConsistency = (wpmHistory) => {
  if (wpmHistory.length < 2) return 0;

  const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
  const variance =
    wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) /
    wpmHistory.length;

  return Math.round(Math.sqrt(variance));
};

/**
 * Get difficulty level based on WPM
 */
export const getDifficultyLevel = (wpm) => {
  if (wpm >= 80)
    return {
      level: "Expert",
      color: "text-purple-500",
      description: "Exceptional typing speed!",
    };
  if (wpm >= 60)
    return {
      level: "Advanced",
      color: "text-blue-500",
      description: "Great typing speed!",
    };
  if (wpm >= 40)
    return {
      level: "Intermediate",
      color: "text-green-500",
      description: "Good typing speed!",
    };
  if (wpm >= 20)
    return {
      level: "Beginner",
      color: "text-yellow-500",
      description: "Keep practicing!",
    };
  return {
    level: "Novice",
    color: "text-gray-500",
    description: "Just getting started!",
  };
};

export default {
  calculateWPM,
  calculateNetWPM,
  calculateAccuracy,
  calculateWordAccuracy,
  analyzeCharacterDifferences,
  isBackspaceAllowed,
  isValidInputChar,
  generateTypingStats,
  calculateWPMConsistency,
  getDifficultyLevel,
};
