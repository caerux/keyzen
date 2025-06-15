import { useMemo } from "react";

const WordDisplay = ({
  words,
  currentWordIndex,
  currentCharIndex,
  currentInput,
  testState,
  currentWordErrors = 0,
  currentWordIncomplete = false,
  typedWords = [],
}) => {
  // Organize words into lines with proper wrapping
  const organizedLines = useMemo(() => {
    const lines = [];
    let currentLine = [];
    let lineLength = 0;
    const maxLineLength = 80; // Approximate characters per line

    words.forEach((word, wordIndex) => {
      const wordLength = word.length + 1; // +1 for space

      if (lineLength + wordLength > maxLineLength && currentLine.length > 0) {
        // Start new line
        lines.push([...currentLine]);
        currentLine = [{ word, wordIndex }];
        lineLength = wordLength;
      } else {
        currentLine.push({ word, wordIndex });
        lineLength += wordLength;
      }
    });

    // Add the last line
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }, [words]);

  // Find which line contains the current word
  const currentLineIndex = useMemo(() => {
    for (let lineIndex = 0; lineIndex < organizedLines.length; lineIndex++) {
      const line = organizedLines[lineIndex];
      for (let wordInLine = 0; wordInLine < line.length; wordInLine++) {
        if (line[wordInLine].wordIndex === currentWordIndex) {
          return lineIndex;
        }
      }
    }
    return 0;
  }, [organizedLines, currentWordIndex]);

  // Calculate which 3 lines to display - scroll when finishing second line
  const visibleLines = useMemo(() => {
    let startLine = 0;

    // When on line 0 or 1, show lines 0, 1, 2
    if (currentLineIndex <= 1) {
      startLine = 0;
    }
    // When on line 2 or beyond, show current line as middle line
    else {
      startLine = currentLineIndex - 1;
    }

    // Ensure we don't go beyond available lines
    if (startLine + 3 > organizedLines.length) {
      startLine = Math.max(0, organizedLines.length - 3);
    }

    return organizedLines.slice(startLine, startLine + 3);
  }, [organizedLines, currentLineIndex]);

  // Check if a word has been completed (typed)
  const isWordCompleted = (wordIndex) => {
    return wordIndex < currentWordIndex;
  };

  // Get the completion status of a completed word
  const getWordCompletionStatus = (wordIndex) => {
    const typedWordData = typedWords.find((_, index) => index === wordIndex);
    return typedWordData ? typedWordData.correct : true;
  };

  const renderWord = (wordData, isCurrentWord, isOnCurrentLine) => {
    const { word, wordIndex } = wordData;
    const isCompleted = isWordCompleted(wordIndex);

    // For completed words, show character-level coloring based on typed data
    if (isCompleted) {
      const typedWordData = typedWords[wordIndex];
      if (typedWordData && typedWordData.typed) {
        const hasErrors = typedWordData.hasErrors || false;

        return (
          <span
            key={`${wordIndex}-${word}`}
            className={`inline-block ${
              hasErrors ? "word-error-underline" : ""
            }`}
          >
            {word.split("").map((char, charIndex) => {
              const typedChar = typedWordData.typed[charIndex];
              let className = "char-untyped";

              if (typedChar !== undefined) {
                className =
                  typedChar === char ? "char-correct" : "char-incorrect";
              }

              return (
                <span key={`${wordIndex}-${charIndex}`} className={className}>
                  {char}
                </span>
              );
            })}

            {/* Show extra characters if user typed more than word length */}
            {typedWordData.typed.length > word.length && (
              <span className="char-incorrect">
                {typedWordData.typed
                  .slice(word.length)
                  .split("")
                  .map((char, index) => (
                    <span key={`extra-${index}`} className="char-incorrect">
                      {char}
                    </span>
                  ))}
              </span>
            )}
          </span>
        );
      } else {
        // Fallback for completed words without typed data
        return (
          <span
            key={`${wordIndex}-${word}`}
            className="inline-block text-green-500"
          >
            {word}
          </span>
        );
      }
    }

    // For current word, show character-level highlighting
    if (isCurrentWord) {
      // Check if current word has errors (wrong characters or incomplete when trying to skip)
      const hasCurrentWordErrors =
        currentWordErrors > 0 || currentWordIncomplete;

      return (
        <span
          key={`${wordIndex}-${word}`}
          className={`inline-block relative ${
            hasCurrentWordErrors ? "word-error-underline" : ""
          }`}
        >
          {word.split("").map((char, charIndex) => {
            let className = "char-untyped";

            if (testState === "active" || testState === "idle") {
              if (charIndex < currentInput.length) {
                // Character has been typed
                className =
                  currentInput[charIndex] === char
                    ? "char-correct"
                    : "char-incorrect";
              } else if (charIndex === currentInput.length) {
                // Current character cursor
                className = "char-current";
              } else {
                // Untyped characters in current word should be same as untyped words
                className = "char-untyped";
              }
            }

            return (
              <span key={`${wordIndex}-${charIndex}`} className={className}>
                {char}
              </span>
            );
          })}

          {/* Show cursor after word if we've typed all characters */}
          {currentInput.length === word.length && (
            <span className="char-current-end"></span>
          )}

          {/* Show extra characters if user typed more than word length */}
          {currentInput.length > word.length && (
            <span className="char-incorrect">
              {currentInput
                .slice(word.length)
                .split("")
                .map((char, index) => (
                  <span key={`extra-${index}`} className="char-incorrect">
                    {char}
                  </span>
                ))}
            </span>
          )}
        </span>
      );
    }

    // For untyped words, show default gray styling
    return (
      <span key={`${wordIndex}-${word}`} className="inline-block char-untyped">
        {word}
      </span>
    );
  };

  return (
    <div className="typing-test-container w-full">
      {/* Word Display Area - Continuous Text */}
      <div className="typing-text leading-relaxed text-2xl tracking-wide w-full">
        {visibleLines.map((line, lineIndex) => {
          const actualLineIndex =
            currentLineIndex <= 1
              ? lineIndex
              : currentLineIndex - 1 + lineIndex;
          const isCurrentDisplayLine = actualLineIndex === currentLineIndex;

          return (
            <span key={`line-${actualLineIndex}`}>
              {line.map((wordData, wordIndex) => {
                const isCurrentWord = wordData.wordIndex === currentWordIndex;
                return (
                  <span key={`word-${wordData.wordIndex}`}>
                    {renderWord(wordData, isCurrentWord, isCurrentDisplayLine)}
                    {/* Always add space after each word except the last word in the entire text */}
                    {wordData.wordIndex < words.length - 1 && " "}
                  </span>
                );
              })}
            </span>
          );
        })}

        {/* Cursor after last word if needed */}
        {testState === "active" && currentWordIndex >= words.length && (
          <span className="char-current text-2xl">|</span>
        )}
      </div>
    </div>
  );
};

export default WordDisplay;
