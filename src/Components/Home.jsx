import React, { useEffect, useReducer, useRef, useCallback } from "react";
import "../css/home.css";
import Grid from "./Grid";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import Confetti from "react-confetti";
import { default as Keyboard } from "./Keyboard";
import gameReducer, { initialState } from "../reducers/gameReducer";
import { fetchRandomWord } from "../services/wordService";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { useGameActions } from "../hooks/useGameActions";

// Pattern constants
const LETTERS_PATTERN = /[A-Z]/;
const ENTER_PATTERN = /enter|{enter}/i;
const BACKSPACE_PATTERN = /backspace|{bksp}/i;

// Timing constants (ms)
const RESET_DELAY = 8000;

function Home() {
  const homeRef = useRef(null);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    word,
    startGame,
    grid,
    columnIndex,
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
  const { handleEnterPressed, handleBackspacePressed, handleTypeLetter } =
    useGameActions(state, dispatch);

  // Memoized callbacks for Navbar
  const handleStartGame = useCallback(
    () => dispatch({ type: "START_GAME" }),
    []
  );
  const handleToggleInfo = useCallback(
    () => dispatch({ type: "TOGGLE_INFO" }),
    []
  );

  // Initialize word when game starts
  useEffect(() => {
    if (startGame === false) return;
    const initializeWord = async () => {
      try {
        const word = await fetchRandomWord();
        dispatch({ type: "SET_WORD", payload: word });
      } catch (error) {
        console.error("Failed to initialize word:", error.message);
      }
    };
    initializeWord();
  }, [startGame]);

  // Reset game after win/lose
  useEffect(() => {
    if (gameWon !== null)
      setTimeout(() => dispatch({ type: "RESET" }), RESET_DELAY);
  }, [gameWon]);

  // Focus home element for keyboard input
  useEffect(() => homeRef.current?.focus(), [grid, startGame]);

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

      if (columnIndex === 5 && key.toLowerCase().match(ENTER_PATTERN) != null) {
        dispatch({ type: "SET_ENTER_PRESSED", payload: true });
      } else if (key.toLowerCase().match(BACKSPACE_PATTERN)) {
        dispatch({ type: "SET_BACKSPACE_PRESSED", payload: true });
      } else {
        if (
          columnIndex === 5 ||
          key.length !== 1 ||
          key.match(LETTERS_PATTERN) == null
        )
          return;
        handleTypeLetter(key);
      }
    },
    [gameWon, columnIndex, handleTypeLetter]
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
          setStartGame={handleStartGame}
          showInfo={showInfo}
          setShowInfo={handleToggleInfo}
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
