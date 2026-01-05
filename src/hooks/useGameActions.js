import { useCallback } from "react";
import { validateWord } from "../services/wordService";
import { getLetterColors, isGameWon } from "../utils/wordUtils";
import {
  SHAKE_DURATION,
  LETTER_REVEAL_INTERVAL,
  CLICK_ANIMATION_DURATION,
} from "../constants/timing";

/**
 * Custom hook providing callbacks for game actions.
 * Returns memoized handlers for Enter, Backspace, and other interactions.
 *
 * @param {Object} state - Current game state
 * @param {Function} dispatch - Reducer dispatch function
 * @returns {Object} Object containing action callbacks
 */
export function useGameActions(state, dispatch) {
  const { grid, rowIndex, columnIndex, word, gameWon } = state;

  /**
   * Handles word submission when Enter is pressed.
   * Validates the word, shows feedback animations, and determines win/lose.
   */
  const handleEnterPressed = useCallback(async () => {
    if (gameWon !== null) return;

    const currentWord = grid[rowIndex].join("");
    const isValid = await validateWord(currentWord);

    if (!isValid) {
      // Shake row for invalid word
      dispatch({
        type: "SET_ROW_SHAKING",
        payload: { row: rowIndex, value: true },
      });
      setTimeout(() => {
        dispatch({
          type: "SET_ROW_SHAKING",
          payload: { row: rowIndex, value: false },
        });
      }, SHAKE_DURATION);
      dispatch({ type: "SET_ENTER_PRESSED", payload: false });
      return;
    }

    // Calculate and reveal letter colors
    const letterColors = getLetterColors(currentWord, word);

    for (let i = 0; i < currentWord.length; i++) {
      setTimeout(() => {
        dispatch({
          type: "SET_LETTER_FEEDBACK",
          payload: {
            row: rowIndex,
            col: i,
            color: letterColors[i],
            key: currentWord[i],
          },
        });
      }, LETTER_REVEAL_INTERVAL * i);
    }

    dispatch({ type: "SUBMIT_WORD" });

    // Check for game over
    const won = isGameWon(letterColors);
    if (won || (rowIndex === 5 && columnIndex === 5)) {
      dispatch({ type: "GAME_OVER", payload: { won } });
    }
  }, [grid, rowIndex, columnIndex, word, gameWon, dispatch]);

  /**
   * Handles letter deletion when Backspace is pressed.
   */
  const handleBackspacePressed = useCallback(() => {
    if (gameWon !== null) return;

    dispatch({ type: "DELETE_LETTER" });

    if (columnIndex > 0) {
      dispatch({
        type: "SET_CLICKED_CELL",
        payload: { row: rowIndex, col: columnIndex - 1 },
      });
      setTimeout(
        () => dispatch({ type: "SET_CLICKED_CELL", payload: null }),
        CLICK_ANIMATION_DURATION
      );
    }

    dispatch({ type: "SET_BACKSPACE_PRESSED", payload: false });
  }, [gameWon, columnIndex, rowIndex, dispatch]);

  /**
   * Handles letter typing with click animation.
   */
  const handleTypeLetter = useCallback(
    (letter) => {
      if (gameWon !== null || columnIndex === 5) return;

      dispatch({
        type: "SET_CLICKED_CELL",
        payload: { row: rowIndex, col: columnIndex },
      });
      setTimeout(
        () => dispatch({ type: "SET_CLICKED_CELL", payload: null }),
        CLICK_ANIMATION_DURATION
      );
      dispatch({ type: "TYPE_LETTER", payload: letter.toUpperCase() });
    },
    [gameWon, columnIndex, rowIndex, dispatch]
  );

  return {
    handleEnterPressed,
    handleBackspacePressed,
    handleTypeLetter,
  };
}
