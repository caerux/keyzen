import { useState, useEffect, useCallback, useRef } from "react";
import WordDisplay from "./WordDisplay";
import Results from "./Results";
import { generateUniqueWordList } from "../data/words";
import { processCustomText } from "../utils/textProcessor";
import { saveTestResult } from "../utils/analytics";

const TypingTest = ({
  testDuration = 60,
  testMode = "words",
  customText = "",
  isSettingsOpen = false,
  isAnalyticsOpen = false,
}) => {
  // Test state management
  const [testState, setTestState] = useState("idle"); // 'idle', 'active', 'completed'
  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [startTime, setStartTime] = useState(null);
  const [resultSaved, setResultSaved] = useState(false);

  // Typing data
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Enhanced metrics tracking
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [typedWords, setTypedWords] = useState([]); // Track completed words with their accuracy
  const [currentWordErrors, setCurrentWordErrors] = useState(0);
  const [currentWordIncomplete, setCurrentWordIncomplete] = useState(false);
  const [isTypingAreaFocused, setIsTypingAreaFocused] = useState(false);

  // Refs to track latest values for timer and analytics
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  const wpmHistoryRef = useRef([]);
  const typedWordsRef = useRef([]);
  const currentWordIndexRef = useRef(0);

  // Update refs when state changes
  useEffect(() => {
    correctCharsRef.current = correctChars;
  }, [correctChars]);

  useEffect(() => {
    incorrectCharsRef.current = incorrectChars;
  }, [incorrectChars]);

  useEffect(() => {
    wpmHistoryRef.current = wpmHistory;
  }, [wpmHistory]);

  useEffect(() => {
    typedWordsRef.current = typedWords;
  }, [typedWords]);

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  // Generate words for the test based on mode
  const [words, setWords] = useState(() => {
    if (testMode === "custom" && customText) {
      return processCustomText(customText);
    }
    return generateUniqueWordList(100);
  });

  // Reset test function (defined early for use in effects)
  const resetTest = useCallback(() => {
    setTestState("idle");
    setTimeLeft(testDuration);
    setCurrentInput("");
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    setWpmHistory([]);
    setTypedWords([]);
    setCurrentWordErrors(0);
    setCurrentWordIncomplete(false);
    setStartTime(null);
    setResultSaved(false);
  }, [testDuration]);

  // Update words when test mode or custom text changes
  useEffect(() => {
    if (testMode === "custom" && customText) {
      const processedWords = processCustomText(customText);
      if (processedWords.length > 0) {
        setWords(processedWords);
        // Reset test when switching to custom text
        resetTest();
      }
    } else if (testMode === "words") {
      setWords(generateUniqueWordList(100));
      // Reset test when switching to word mode
      resetTest();
    }
  }, [testMode, customText, resetTest]);

  // Update timeLeft when testDuration changes
  useEffect(() => {
    if (testState === "idle") {
      setTimeLeft(testDuration);
    }
  }, [testDuration, testState]);

  // Timer effect with WPM history recording
  useEffect(() => {
    let interval = null;
    if (testState === "active") {
      interval = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft <= 1) {
            setTestState("completed");
            return 0;
          }
          return prevTimeLeft - 1;
        });

        // Record WPM every second in a separate state update
        setWpmHistory((prev) => {
          // Calculate WPM using current values at this moment
          const currentTime = Date.now();
          const timeElapsedSeconds = startTime
            ? (currentTime - startTime) / 1000
            : 0;

          if (timeElapsedSeconds <= 1) {
            // For the first second, calculate initial WPM
            let correctWordChars = 0;
            typedWordsRef.current.forEach((wordData, index) => {
              if (wordData.correct) {
                correctWordChars += wordData.word.length;
                if (index < typedWordsRef.current.length - 1) {
                  correctWordChars += 1;
                }
              }
            });
            const initialWPM =
              correctWordChars > 0
                ? Math.floor((correctWordChars / 5) * 60)
                : 0;
            return [initialWPM];
          }

          // Count characters in correctly typed words only (including spaces between them)
          let correctWordChars = 0;
          typedWordsRef.current.forEach((wordData, index) => {
            if (wordData.correct) {
              correctWordChars += wordData.word.length;
              if (index < typedWordsRef.current.length - 1) {
                correctWordChars += 1; // Add space after word (except last word)
              }
            }
          });

          // WPM = (correct word characters / 5) * (60 / time in seconds)
          const currentWPM =
            Math.floor((correctWordChars / 5) * (60 / timeElapsedSeconds)) || 0;
          return [...prev, currentWPM];
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testState, startTime]); // Minimal dependencies

  // Save test result when test completes (separate effect to prevent duplicates)
  useEffect(() => {
    if (testState === "completed" && !resultSaved) {
      // Calculate final WPM using correctly typed words only
      let correctWordChars = 0;
      typedWordsRef.current.forEach((wordData, index) => {
        if (wordData.correct) {
          correctWordChars += wordData.word.length;
          if (index < typedWordsRef.current.length - 1) {
            correctWordChars += 1; // Add space after word (except last word)
          }
        }
      });
      const finalWPM = Math.floor((correctWordChars / 5) * (60 / testDuration));

      const testResult = {
        wpm: finalWPM,
        accuracy:
          Math.round(
            (correctCharsRef.current /
              (correctCharsRef.current + incorrectCharsRef.current)) *
              100
          ) || 100,
        correctChars: correctCharsRef.current,
        incorrectChars: incorrectCharsRef.current,
        timeElapsed: testDuration,
        testDuration,
        testMode,
        customText: testMode === "custom" ? customText : null,
        wpmHistory: wpmHistoryRef.current,
        typedWords: typedWordsRef.current,
        totalWords: currentWordIndexRef.current,
        consistency:
          wpmHistoryRef.current.length > 1
            ? (() => {
                const mean =
                  wpmHistoryRef.current.reduce((sum, wpm) => sum + wpm, 0) /
                  wpmHistoryRef.current.length;
                if (mean === 0) return 100;
                const variance =
                  wpmHistoryRef.current.reduce(
                    (sum, wpm) => sum + Math.pow(wpm - mean, 2),
                    0
                  ) / wpmHistoryRef.current.length;
                const standardDeviation = Math.sqrt(variance);
                const coefficientOfVariation = standardDeviation / mean;
                return Math.max(
                  0,
                  Math.round(100 - coefficientOfVariation * 100)
                );
              })()
            : 100,
      };

      saveTestResult(testResult);
      setResultSaved(true);
    }
  }, [testState, resultSaved, testDuration, testMode, customText]);

  // Start test on first keystroke
  const startTest = useCallback(() => {
    if (testState === "idle") {
      setTestState("active");
      setStartTime(Date.now());
      setTimeLeft(testDuration);
      setWpmHistory([]); // Initialize empty, will be populated by timer
    }
  }, [testState, testDuration]);

  // Enhanced keyboard input handling (direct typing on text)
  const handleKeyPress = useCallback(
    (event) => {
      if (testState === "completed" || isSettingsOpen || isAnalyticsOpen)
        return;

      const key = event.key;
      const currentWord = words[currentWordIndex];
      if (!currentWord) return;

      // Only handle typing if the typing area is focused
      const typingArea = document.getElementById("typing-area");
      if (!typingArea || !typingArea.contains(document.activeElement)) {
        return;
      }

      // Prevent default for typing keys
      if (key.length === 1 || key === "Backspace") {
        event.preventDefault();
      }

      // Handle backspace
      if (key === "Backspace") {
        // Only allow backspace within current word
        if (currentInput.length === 0) return;

        const newInput = currentInput.slice(0, -1);
        setCurrentInput(newInput);
        setCurrentCharIndex(newInput.length);

        // Recalculate errors for current word
        let errors = 0;
        for (let i = 0; i < newInput.length; i++) {
          if (newInput[i] !== currentWord[i]) {
            errors++;
          }
        }
        setCurrentWordErrors(errors);

        return;
      }

      // Handle space - move to next word
      if (key === " ") {
        // Rule 1: Don't allow space if no characters have been typed
        if (currentInput.length === 0) {
          return;
        }

        // Rule 2: Mark word as incomplete if not fully typed
        const wordIncomplete = currentInput.length < currentWord.length;
        if (wordIncomplete) {
          setCurrentWordIncomplete(true);
          // Don't return here, allow the word to be processed but marked as having errors
        }

        if (testState !== "active") {
          startTest();
        }

        const typedWord = currentInput;
        const isCorrect = typedWord === currentWord;
        const isIncomplete = typedWord.length < currentWord.length;
        const hasErrors = currentWordErrors > 0;

        // Calculate correct and incorrect characters for this word
        let correctInWord = 0;
        let incorrectInWord = 0;

        for (
          let i = 0;
          i < Math.max(typedWord.length, currentWord.length);
          i++
        ) {
          if (i < currentWord.length && i < typedWord.length) {
            if (typedWord[i] === currentWord[i]) {
              correctInWord++;
            } else {
              incorrectInWord++;
            }
          } else if (i >= currentWord.length) {
            // Extra characters
            incorrectInWord++;
          } else {
            // Missing characters
            incorrectInWord++;
          }
        }

        // Update overall metrics
        setCorrectChars((prev) => prev + correctInWord);
        setIncorrectChars((prev) => prev + incorrectInWord);

        // Record word completion
        setTypedWords((prev) => [
          ...prev,
          {
            word: currentWord,
            typed: typedWord,
            correct: isCorrect,
            correctChars: correctInWord,
            incorrectChars: incorrectInWord,
            timestamp: Date.now(),
            hasErrors: hasErrors || isIncomplete, // Mark as having errors if incomplete or wrong chars
          },
        ]);

        // Move to next word
        setCurrentWordIndex((prev) => prev + 1);
        setCurrentInput("");
        setCurrentCharIndex(0);
        setCurrentWordErrors(0);
        setCurrentWordIncomplete(false);

        return;
      }

      // Handle regular character input
      if (key.length === 1) {
        startTest();

        // Prevent typing beyond reasonable length (word + 10 extra chars)
        if (currentInput.length >= currentWord.length + 10) {
          return;
        }

        const newInput = currentInput + key;
        setCurrentInput(newInput);
        setCurrentCharIndex(newInput.length);

        // Count errors in current word
        let errors = 0;
        for (let i = 0; i < newInput.length; i++) {
          if (i >= currentWord.length || newInput[i] !== currentWord[i]) {
            errors++;
          }
        }
        setCurrentWordErrors(errors);
      }
    },
    [
      testState,
      currentInput,
      currentWordIndex,
      words,
      startTest,
      isSettingsOpen,
      isAnalyticsOpen,
    ]
  );

  // Restart test (keyboard shortcut)
  const restartTest = () => {
    resetTest();
    // Don't auto-start, wait for user input
  };

  // WPM calculation - correctly typed words only (including spaces)
  const calculateWPM = () => {
    if (!startTime || testState === "idle") return 0;
    const timeElapsed = (Date.now() - startTime) / 1000; // seconds
    if (timeElapsed === 0) return 0;

    // Count characters in correctly typed words only (including spaces between them)
    let correctWordChars = 0;
    typedWords.forEach((wordData, index) => {
      if (wordData.correct) {
        correctWordChars += wordData.word.length;
        if (index < typedWords.length - 1) {
          correctWordChars += 1; // Add space after word (except last word)
        }
      }
    });

    // WPM = (correct word characters / 5) * (60 / time in seconds)
    const wpm = (correctWordChars / 5) * (60 / timeElapsed);
    return Math.floor(wpm) || 0;
  };

  // Accuracy calculation - percentage of correctly pressed keys
  const calculateAccuracy = () => {
    const totalChars = correctChars + incorrectChars;
    if (totalChars === 0) return 100;
    return Math.round((correctChars / totalChars) * 100);
  };

  // Calculate consistency based on WPM variance (coefficient of variation)
  const calculateConsistency = () => {
    // If no typing has started, show 0 instead of 100
    if (wpmHistory.length < 2 || !hasStartedTyping) return 0;

    const mean =
      wpmHistory.reduce((sum, wpm) => sum + wpm, 0) / wpmHistory.length;
    if (mean === 0) return 0;

    const variance =
      wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) /
      wpmHistory.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;

    // Map coefficient of variation to 0-100 scale (lower CV = higher consistency)
    const consistency = Math.max(0, 100 - coefficientOfVariation * 100);
    return Math.round(consistency);
  };

  // Get current word analysis
  const getCurrentWordAnalysis = () => {
    const currentWord = words[currentWordIndex];
    if (!currentWord) return { correct: 0, incorrect: 0, remaining: 0 };

    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < currentInput.length; i++) {
      if (i < currentWord.length && currentInput[i] === currentWord[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const remaining = Math.max(0, currentWord.length - currentInput.length);

    return { correct, incorrect, remaining };
  };

  // Auto-focus typing area on component mount
  useEffect(() => {
    const typingArea = document.getElementById("typing-area");
    if (typingArea && !isSettingsOpen && !isAnalyticsOpen) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        typingArea.focus();
      }, 100);
    }
  }, [isSettingsOpen, isAnalyticsOpen]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle any keyboard events if settings or analytics modal is open
      if (isSettingsOpen || isAnalyticsOpen) {
        return;
      }

      // Handle shortcuts first
      if (e.key === "Tab" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        restartTest();
        return;
      } else if (e.key === "Escape") {
        e.preventDefault();
        resetTest();
        return;
      }

      // Handle typing input
      handleKeyPress(e);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, isSettingsOpen, isAnalyticsOpen]);

  // Calculate real-time stats
  const currentWordAnalysis = getCurrentWordAnalysis();
  const totalCorrectChars = correctChars + currentWordAnalysis.correct;
  const totalIncorrectChars = incorrectChars + currentWordAnalysis.incorrect;
  const hasStartedTyping = totalCorrectChars + totalIncorrectChars > 0;
  const realTimeAccuracy = hasStartedTyping
    ? Math.round(
        (totalCorrectChars / (totalCorrectChars + totalIncorrectChars)) * 100
      )
    : 0;

  if (testState === "completed") {
    return (
      <Results
        wpm={calculateWPM()}
        accuracy={calculateAccuracy()}
        correctChars={correctChars}
        incorrectChars={incorrectChars}
        timeElapsed={testDuration}
        onRestart={restartTest}
        onReset={resetTest}
        wpmHistory={wpmHistory}
        typedWords={typedWords}
        totalWords={currentWordIndex}
        testDuration={testDuration}
        consistency={calculateConsistency()}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Enhanced Test Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6 text-lg">
          <div className="text-gray-600 dark:text-gray-400">
            Time:{" "}
            <span className="font-mono text-xl font-bold text-blue-500">
              {timeLeft}s
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            WPM:{" "}
            <span className="font-mono text-xl font-bold text-green-500">
              {calculateWPM()}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Accuracy:{" "}
            <span className="font-mono text-xl font-bold text-purple-500">
              {realTimeAccuracy}%
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Words:{" "}
            <span className="font-mono text-xl font-bold text-orange-500">
              {currentWordIndex}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Consistency:{" "}
            <span className="font-mono text-xl font-bold text-indigo-500">
              {calculateConsistency()}%
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={resetTest}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={restartTest}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Restart
          </button>
        </div>
      </div>

      {/* Typing Area Container */}
      <div className="flex justify-center items-center min-h-[60vh]">
        <div
          id="typing-area"
          className="relative bg-transparent cursor-text outline-none focus:outline-none"
          tabIndex={0}
          onFocus={() => {
            setIsTypingAreaFocused(true);
          }}
          onBlur={() => {
            setIsTypingAreaFocused(false);
          }}
        >
          <div
            className={`transition-all duration-200 ${
              isTypingAreaFocused ? "blur-0" : "blur-sm"
            }`}
          >
            <WordDisplay
              words={words}
              currentWordIndex={currentWordIndex}
              currentCharIndex={currentCharIndex}
              currentInput={currentInput}
              testState={testState}
              currentWordErrors={currentWordErrors}
              currentWordIncomplete={currentWordIncomplete}
              typedWords={typedWords}
            />
          </div>

          {/* Focus overlay when not focused - positioned to match text height */}
          {!isTypingAreaFocused && (
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
              <div className="text-gray-400 text-lg font-medium bg-gray-900/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                Click here to focus
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status and Instructions */}
      <div className="mt-8 text-center">
        {testState === "idle" && (
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Click on the text area above and start typing to begin the test...
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        <span className="mr-4">Tab or Ctrl+R: Restart</span>
        <span className="mr-4">Esc: Reset</span>
        <span>Just start typing!</span>
      </div>
    </div>
  );
};

export default TypingTest;
