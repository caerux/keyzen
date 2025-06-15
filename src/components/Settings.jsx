import { useState, useEffect } from "react";

const Settings = ({
  isOpen,
  onClose,
  testDuration,
  onTestDurationChange,
  theme,
  onThemeChange,
  testMode,
  onTestModeChange,
  customText,
  onCustomTextChange,
}) => {
  const [tempDuration, setTempDuration] = useState(testDuration);
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempTestMode, setTempTestMode] = useState(testMode || "words");
  const [tempCustomText, setTempCustomText] = useState(customText || "");

  const durationOptions = [
    { value: 15, label: "15 seconds" },
    { value: 30, label: "30 seconds" },
    { value: 60, label: "1 minute" },
    { value: 120, label: "2 minutes" },
  ];

  useEffect(() => {
    setTempDuration(testDuration);
    setTempTheme(theme);
    setTempTestMode(testMode || "words");
    setTempCustomText(customText || "");
  }, [testDuration, theme, testMode, customText, isOpen]);

  const handleSave = () => {
    // Validate custom text if in custom mode
    if (tempTestMode === "custom" && tempCustomText.length < 50) {
      alert("Custom text must be at least 50 characters long.");
      return;
    }

    onTestDurationChange(tempDuration);
    onThemeChange(tempTheme);
    onTestModeChange(tempTestMode);
    onCustomTextChange(tempCustomText);
    onClose();
  };

  const handleCancel = () => {
    setTempDuration(testDuration);
    setTempTheme(theme);
    setTempTestMode(testMode || "words");
    setTempCustomText(customText || "");
    onClose();
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Test Mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Test Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTempTestMode("words")}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                tempTestMode === "words"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">📝</span>
                Words
              </div>
            </button>
            <button
              onClick={() => setTempTestMode("custom")}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                tempTestMode === "custom"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">✏️</span>
                Custom Text
              </div>
            </button>
          </div>
        </div>

        {/* Custom Text Input */}
        {tempTestMode === "custom" && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Custom Text
            </label>
            <textarea
              value={tempCustomText}
              onChange={(e) => setTempCustomText(e.target.value)}
              placeholder="Enter your custom text here... (minimum 50 characters)"
              className="w-full h-32 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              maxLength={2000}
            />
            <div className="mt-2 text-sm text-gray-500">
              {tempCustomText.length}/2000 characters
              {tempCustomText.length < 50 && tempCustomText.length > 0 && (
                <span className="text-red-500 ml-2">
                  (minimum 50 characters required)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Test Duration */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Test Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTempDuration(option.value)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  tempDuration === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <div className="font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Theme</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTempTheme("light")}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                tempTheme === "light"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">☀️</span>
                Light
              </div>
            </button>
            <button
              onClick={() => setTempTheme("dark")}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                tempTheme === "dark"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2">🌙</span>
                Dark
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            Save Settings
          </button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Press Esc to close
        </div>
      </div>
    </div>
  );
};

export default Settings;
