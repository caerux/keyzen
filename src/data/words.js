// Common English words for typing tests
export const commonWords = [
  // Most frequent English words
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",

  // Action words
  "run",
  "walk",
  "jump",
  "swim",
  "fly",
  "drive",
  "eat",
  "drink",
  "sleep",
  "wake",
  "read",
  "write",
  "speak",
  "listen",
  "watch",
  "play",
  "work",
  "study",
  "learn",
  "teach",
  "build",
  "create",
  "make",
  "break",
  "fix",
  "clean",
  "wash",
  "cook",
  "bake",
  "grow",
  "plant",
  "water",
  "cut",
  "draw",
  "paint",
  "sing",
  "dance",
  "laugh",
  "cry",
  "smile",

  // Common nouns
  "house",
  "car",
  "tree",
  "flower",
  "book",
  "table",
  "chair",
  "door",
  "window",
  "computer",
  "phone",
  "food",
  "water",
  "fire",
  "earth",
  "air",
  "sun",
  "moon",
  "star",
  "cloud",
  "rain",
  "snow",
  "wind",
  "mountain",
  "river",
  "ocean",
  "beach",
  "forest",
  "park",
  "city",
  "street",
  "school",
  "office",
  "store",
  "market",
  "hospital",
  "library",
  "museum",
  "theater",
  "restaurant",

  // Descriptive words
  "big",
  "small",
  "tall",
  "short",
  "long",
  "wide",
  "narrow",
  "thick",
  "thin",
  "heavy",
  "light",
  "dark",
  "bright",
  "fast",
  "slow",
  "hot",
  "cold",
  "warm",
  "cool",
  "dry",
  "wet",
  "clean",
  "dirty",
  "old",
  "new",
  "young",
  "happy",
  "sad",
  "angry",
  "calm",
  "quiet",
  "loud",
  "soft",
  "hard",
  "smooth",
  "rough",
  "sweet",
  "sour",
  "bitter",
  "salty",

  // Colors
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
  "gray",
  "silver",
  "gold",
  "violet",
  "indigo",
  "turquoise",
  "cyan",
  "magenta",
  "lime",
  "navy",

  // Numbers as words
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
  "hundred",
  "thousand",

  // Technology words
  "computer",
  "internet",
  "website",
  "email",
  "password",
  "software",
  "hardware",
  "keyboard",
  "mouse",
  "screen",
  "monitor",
  "laptop",
  "tablet",
  "smartphone",
  "app",
  "download",
  "upload",
  "file",
  "folder",
  "document",
  "program",
  "code",
  "data",
  "network",
  "wifi",
  "bluetooth",
  "battery",
  "charge",
  "memory",
  "storage",
];

// Generate a random word list for testing
export const generateWordList = (count = 50) => {
  const words = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    words.push(commonWords[randomIndex]);
  }
  return words;
};

// Generate word list without consecutive duplicates
export const generateUniqueWordList = (count = 50) => {
  const words = [];
  let lastWord = "";

  for (let i = 0; i < count; i++) {
    let randomWord;
    do {
      const randomIndex = Math.floor(Math.random() * commonWords.length);
      randomWord = commonWords[randomIndex];
    } while (randomWord === lastWord && commonWords.length > 1);

    words.push(randomWord);
    lastWord = randomWord;
  }
  return words;
};

export default { commonWords, generateWordList, generateUniqueWordList };
