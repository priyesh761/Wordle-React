/**
 * Calculates the color feedback for each letter in a guessed word.
 * - Green: correct letter in correct position
 * - Orange: correct letter in wrong position
 * - Grey: letter not in word
 *
 * @param {string} guessedWord - The word the user guessed (uppercase)
 * @param {string} actualWord - The target word (uppercase)
 * @returns {string[]} Array of 5 colors ('green', 'orange', or 'grey')
 */
export function getLetterColors(guessedWord, actualWord) {
  const actual = actualWord.split("");
  const colors = Array(5).fill("grey");

  // First pass: mark exact matches (green)
  for (let i = 0; i < guessedWord.length; i++) {
    if (guessedWord[i] === actual[i]) {
      colors[i] = "green";
      actual[i] = "$"; // Mark as used
    }
  }

  // Second pass: mark partial matches (orange)
  for (let i = 0; i < guessedWord.length; i++) {
    if (colors[i] !== "green" && actual.includes(guessedWord[i])) {
      colors[i] = "orange";
      const index = actual.indexOf(guessedWord[i]);
      actual[index] = "$"; // Mark as used
    }
  }

  return colors;
}

/**
 * Checks if all letters in the guess are correct (all green).
 * @param {string[]} colors - Array of color strings from getLetterColors
 * @returns {boolean} True if all colors are green
 */
export function isGameWon(colors) {
  return colors.every((color) => color === "green");
}
