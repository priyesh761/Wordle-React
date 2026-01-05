import { useEffect, useRef, useCallback } from "react";
import { useGameActions } from "./useGameActions";
import { fetchRandomWord } from "../services/wordService";
import { RESET_DELAY } from "../constants/timing";

// Pattern constants for keyboard input
const LETTERS_PATTERN = /[A-Z]/;
const ENTER_PATTERN = /enter|{enter}/i;
const BACKSPACE_PATTERN = /backspace|{bksp}/i;

/**
 * Custom hook that manages all game lifecycle side effects.
 * Encapsulates word initialization, game reset, focus management, and key press handling.
 *
 * @param {Object} state - The game state from useReducer
 * @param {Function} dispatch - The dispatch function from useReducer
 * @returns {Object} - Contains focusContainerRef and handleKeyDown
 */
export function useGameLifecycle(state, dispatch) {
  // Ref for the element that receives keyboard focus
  const focusContainerRef = useRef(null);

  // Compose with useGameActions hook
  const { handleEnterPressed, handleBackspacePressed, handleTypeLetter } =
    useGameActions(state, dispatch);

  const { startGame, gameWon, grid, columnIndex, isEnterPressed, isBackspacePressed } = state;

  // Initialize word when game starts
  useEffect(() => {
    if (startGame === false) return;
    const initializeWord = async () => {
      try {
        const word = await fetchRandomWord();
        dispatch({ type: "SET_WORD", payload: word });
      } catch (error) {
        console.error("Failed to initialize word:", error.message);
        dispatch({ type: "SET_ERROR", payload: error.message });
      }
    };
    initializeWord();
  }, [startGame, dispatch]);

  // Reset game after win/lose
  useEffect(() => {
    if (gameWon === null) return;
    const timer = setTimeout(() => dispatch({ type: "RESET" }), RESET_DELAY);
    return () => clearTimeout(timer);
  }, [gameWon, dispatch]);

  // Focus container element for keyboard input
  useEffect(() => {
    focusContainerRef.current?.focus();
  }, [grid, startGame]);

  // Handle Enter key press
  useEffect(() => {
    if (isEnterPressed) handleEnterPressed();
  }, [isEnterPressed, handleEnterPressed]);

  // Handle Backspace key press
  useEffect(() => {
    if (isBackspacePressed) handleBackspacePressed();
  }, [isBackspacePressed, handleBackspacePressed]);

  // Keyboard input handler
  const handleKeyDown = useCallback(
    (key) => {
      if (gameWon !== null) return;

      if (
        columnIndex === 5 &&
        key.toLowerCase().match(ENTER_PATTERN) !== null
      ) {
        dispatch({ type: "SET_ENTER_PRESSED", payload: true });
      } else if (key.toLowerCase().match(BACKSPACE_PATTERN)) {
        dispatch({ type: "SET_BACKSPACE_PRESSED", payload: true });
      } else {
        if (
          columnIndex === 5 ||
          key.length !== 1 ||
          key.match(LETTERS_PATTERN) === null
        )
          return;
        handleTypeLetter(key);
      }
    },
    [gameWon, columnIndex, handleTypeLetter, dispatch]
  );

  return {
    focusContainerRef,
    handleKeyDown
  };
}
