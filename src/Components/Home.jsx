import React, { useEffect, useReducer, useRef, useCallback } from "react";
import "../css/home.css";
import Grid from "./Grid";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import Confetti from "react-confetti";
import { default as Keyboard } from "./Keyboard";
import gameReducer, { initialState } from "../reducers/gameReducer";
import { fetchRandomWord, validateWord } from "../services/wordService";
import { getLetterColors, isGameWon } from "../utils/wordUtils";
import { useWindowDimensions } from "../hooks/useWindowDimensions";

function Home() {
  const homeRef = useRef(null);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    word,
    startGame,
    grid,
    columnIndex,
    rowIndex,
    showInfo,
    gameWon,
    isEnterPressed,
    isBackspacePressed,
    isShaking,
    cellStates,
    keyColors,
    clickedCell,
  } = state;

  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    if (startGame === false) return;
    const initializeWord = async () => {
      try {
        const word = await fetchRandomWord();
        dispatch({ type: "SET_WORD", payload: word });
        console.log("Word Initialized");
      } catch (error) {
        console.error("Failed to initialize word:", error.message);
      }
    };
    initializeWord();
  }, [startGame]);
  useEffect(() => {
    if (gameWon !== null) setTimeout(() => dispatch({ type: "RESET" }), 8000);
  }, [gameWon]);
  useEffect(() => homeRef.current?.focus(), [grid, startGame]);
  useEffect(() => {
    if (gameWon !== null) return;
    if (isEnterPressed !== true) return;

    const currentWord = grid[rowIndex].join("");

    const handleWordSubmission = async () => {
      const isValid = await validateWord(currentWord);

      if (!isValid) {
        dispatch({
          type: "SET_ROW_SHAKING",
          payload: { row: rowIndex, value: true },
        });
        setTimeout(() => {
          dispatch({
            type: "SET_ROW_SHAKING",
            payload: { row: rowIndex, value: false },
          });
        }, 1000);
        dispatch({ type: "SET_ENTER_PRESSED", payload: false });
        return;
      }

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
        }, 450 * i);
      }

      dispatch({ type: "SUBMIT_WORD" });

      const won = isGameWon(letterColors);
      if (won || (rowIndex === 5 && columnIndex === 5)) {
        dispatch({ type: "GAME_OVER", payload: { won } });
      }
    };

    handleWordSubmission();
  }, [isEnterPressed]);
  useEffect(() => {
    if (gameWon !== null) return;
    if (isBackspacePressed === false) return;
    dispatch({ type: "DELETE_LETTER" });

    if (columnIndex > 0) {
      dispatch({
        type: "SET_CLICKED_CELL",
        payload: { row: rowIndex, col: columnIndex - 1 },
      });
      setTimeout(
        () => dispatch({ type: "SET_CLICKED_CELL", payload: null }),
        500
      );
    }

    dispatch({ type: "SET_BACKSPACE_PRESSED", payload: false });
  }, [isBackspacePressed]);
  const handleKeyDown = useCallback(
    (key) => {
      if (gameWon !== null) return;
      const lettersPattern = /[A-Z]/;
      const enterPattern = /enter|{enter}/; // enter or  {enter}
      const backspacePattern = /backspace|{bksp}/; // backspace or {bksp}

      if (columnIndex === 5 && key.toLowerCase().match(enterPattern) != null) {
        dispatch({ type: "SET_ENTER_PRESSED", payload: true });
      } else if (key.toLowerCase().match(backspacePattern))
        dispatch({ type: "SET_BACKSPACE_PRESSED", payload: true });
      else {
        if (
          columnIndex === 5 ||
          key.length !== 1 ||
          key.match(lettersPattern) == null
        )
          return;
        dispatch({
          type: "SET_CLICKED_CELL",
          payload: { row: rowIndex, col: columnIndex },
        });
        setTimeout(
          () => dispatch({ type: "SET_CLICKED_CELL", payload: null }),
          500
        );
        dispatch({ type: "TYPE_LETTER", payload: key.toUpperCase() });
      }
    },
    [gameWon, columnIndex, rowIndex, dispatch]
  );

  return (
    <div
      ref={homeRef}
      id="home"
      className="container-fluid justify-content-around"
      tabIndex={0}
      onKeyDown={(e) => handleKeyDown(e.key.toUpperCase())}
    >
      <header className="row">
        <Navbar
          startGame={startGame}
          setStartGame={() => dispatch({ type: "START_GAME" })}
          showInfo={showInfo}
          setShowInfo={() => dispatch({ type: "TOGGLE_INFO" })}
          homeRef={homeRef}
        />
      </header>
      {(startGame === false || word == null) && <Spinner />}
      {startGame === true && word != null && (
        <main className="row justify-content-center">
          <Grid
            grid={grid}
            isShaking={isShaking}
            cellStates={cellStates}
            clickedCell={clickedCell}
          />
          <Keyboard handleKeyDown={handleKeyDown} keyColors={keyColors} />
        </main>
      )}
      {gameWon && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
        />
      )}
    </div>
  );
}

export default Home;
