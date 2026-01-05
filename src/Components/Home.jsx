import React, { useReducer, useCallback, Suspense } from "react";
import "../css/home.css";
import Grid from "./Grid";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import gameReducer, { initialState } from "../reducers/gameReducer";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { useGameLifecycle } from "../hooks/useGameLifecycle";

// Lazy load heavy third-party components
const Keyboard = React.lazy(() => import("./Keyboard"));
const Confetti = React.lazy(() => import("react-confetti"));

function Home() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    word,
    startGame,
    grid,
    showInfo,
    gameWon,
    isShaking,
    cellStates,
    keyColors,
    clickedCell,
  } = state;

  const windowDimensions = useWindowDimensions();

  // Hook handles all game lifecycle effects and keyboard input
  const { focusContainerRef, handleKeyDown } = useGameLifecycle(
    state,
    dispatch
  );

  // Memoized callbacks for Navbar
  const handleStartGame = useCallback(
    () => dispatch({ type: "START_GAME" }),
    []
  );
  const handleToggleInfo = useCallback(
    () => dispatch({ type: "TOGGLE_INFO" }),
    []
  );

  return (
    <div
      ref={focusContainerRef}
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
          focusContainerRef={focusContainerRef}
        />
      </header>
      {(!startGame || !word) && <Spinner />}
      {startGame && word && (
        <Suspense fallback={<Spinner />}>
          <main className="row justify-content-center">
            <Grid
              grid={grid}
              isShaking={isShaking}
              cellStates={cellStates}
              clickedCell={clickedCell}
            />
            <Keyboard handleKeyDown={handleKeyDown} keyColors={keyColors} />
          </main>
        </Suspense>
      )}
      {gameWon && (
        <Suspense fallback={null}>
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
          />
        </Suspense>
      )}
    </div>
  );
}

export default Home;
