import axios from "axios";

const RANDOM_WORD_API = "https://random-word-api.herokuapp.com/word?length=5";
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";
const MAX_RETRIES = 10;

/**
 * Fetches a random 5-letter word that exists in the dictionary.
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Promise<string>} A valid uppercase word
 * @throws {Error} If unable to fetch a valid word after max retries
 */
export async function fetchRandomWord(retryCount = 0) {
  if (retryCount >= MAX_RETRIES) {
    throw new Error("Unable to fetch a valid word. Please try again later.");
  }

  try {
    const { data } = await axios.get(RANDOM_WORD_API);
    const word = data[0];

    // Validate the word exists in dictionary
    await axios.get(`${DICTIONARY_API}/${word}`);

    return word.toUpperCase();
  } catch {
    // Word not in dictionary or API error - retry with a new word
    return fetchRandomWord(retryCount + 1);
  }
}

/**
 * Validates if a word exists in the dictionary.
 * @param {string} word - The word to validate
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
export async function validateWord(word) {
  try {
    await axios.get(`${DICTIONARY_API}/${word.toLowerCase()}`);
    return true;
  } catch {
    return false;
  }
}
