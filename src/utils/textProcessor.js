// Text processing utilities for custom text input

/**
 * Process custom text into an array of words for typing test
 * @param {string} text - The custom text input
 * @returns {string[]} - Array of words
 */
export const processCustomText = (text) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Clean the text: remove extra whitespace, normalize punctuation
  const cleanedText = text
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[""]/g, '"') // Normalize quotes
    .replace(/['']/g, "'") // Normalize apostrophes
    .replace(/…/g, "...") // Normalize ellipsis
    .replace(/—/g, "--") // Normalize em dash
    .replace(/–/g, "-"); // Normalize en dash

  // Split into words while preserving punctuation
  const words = cleanedText
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.trim());

  return words;
};

/**
 * Validate custom text for typing test
 * @param {string} text - The custom text input
 * @returns {object} - Validation result with isValid and message
 */
export const validateCustomText = (text) => {
  if (!text || typeof text !== "string") {
    return {
      isValid: false,
      message: "Text is required",
    };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < 50) {
    return {
      isValid: false,
      message: "Text must be at least 50 characters long",
    };
  }

  if (trimmedText.length > 2000) {
    return {
      isValid: false,
      message: "Text must be less than 2000 characters",
    };
  }

  const words = processCustomText(trimmedText);

  if (words.length < 10) {
    return {
      isValid: false,
      message: "Text must contain at least 10 words",
    };
  }

  return {
    isValid: true,
    message: "Text is valid",
    wordCount: words.length,
    charCount: trimmedText.length,
  };
};

/**
 * Get sample custom texts for users
 * @returns {object[]} - Array of sample texts with titles
 */
export const getSampleTexts = () => {
  return [
    {
      title: "Classic Literature",
      text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    },
    {
      title: "Technology",
      text: "The rapid advancement of artificial intelligence and machine learning technologies has transformed the way we interact with computers and process information. From natural language processing to computer vision, these technologies are reshaping industries and creating new possibilities for innovation and human-computer collaboration.",
    },
    {
      title: "Science",
      text: "The scientific method is a systematic approach to understanding the natural world through observation, hypothesis formation, experimentation, and analysis. This process has led to countless discoveries and innovations that have improved human life and expanded our knowledge of the universe around us.",
    },
  ];
};
