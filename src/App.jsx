import { useState, useEffect } from "react";
import TypingTest from "./components/TypingTest";
import Settings from "./components/Settings";
import Analytics from "./components/Analytics";

function App() {
  const [theme, setTheme] = useState("light");
  const [testDuration, setTestDuration] = useState(60);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [testMode, setTestMode] = useState("words");
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    // Load preferences from localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedDuration = parseInt(localStorage.getItem("testDuration")) || 60;
    const savedTestMode = localStorage.getItem("testMode") || "words";
    const savedCustomText = localStorage.getItem("customText") || "";

    setTheme(savedTheme);
    setTestDuration(savedDuration);
    setTestMode(savedTestMode);
    setCustomText(savedCustomText);

    // Apply theme to document
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleTestDurationChange = (newDuration) => {
    setTestDuration(newDuration);
    localStorage.setItem("testDuration", newDuration.toString());
  };

  const handleTestModeChange = (newTestMode) => {
    setTestMode(newTestMode);
    localStorage.setItem("testMode", newTestMode);
  };

  const handleCustomTextChange = (newCustomText) => {
    setCustomText(newCustomText);
    localStorage.setItem("customText", newCustomText);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    handleThemeChange(newTheme);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1
            className="text-3xl font-bold cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => window.location.reload()}
          >
            Keyzen
          </h1>

          <div className="flex items-center gap-4">
            {/* Analytics Button */}
            <button
              onClick={() => setShowAnalytics(true)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Analytics & Progress"
            >
              📊
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Settings"
            >
              ⚙️
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <TypingTest
          testDuration={testDuration}
          testMode={testMode}
          customText={customText}
          isSettingsOpen={showSettings}
          isAnalyticsOpen={showAnalytics}
        />
      </main>

      {/* Footer pushed to bottom */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Keyzen - Built with React, Tailwind CSS, and Chart.js</p>
        </div>
      </footer>

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        testDuration={testDuration}
        onTestDurationChange={handleTestDurationChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        testMode={testMode}
        onTestModeChange={handleTestModeChange}
        customText={customText}
        onCustomTextChange={handleCustomTextChange}
      />

      {/* Analytics Modal */}
      {showAnalytics && <Analytics onClose={() => setShowAnalytics(false)} />}
    </div>
  );
}

export default App;
