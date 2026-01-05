import React, { useEffect, useState, useReducer, useRef } from "react";
import axios from "axios";
import "../css/home.css";
import Grid from "./Grid";
import Navbar from "./Navbar";
import Spinner from "./Spinner";
import Confetti from "react-confetti";
import { default as Keyboard } from "./Keyboard";
import gameReducer, { initialState } from "../reducers/gameReducer";

function Home() {
  const homeRef = useRef(null);
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const {
    word,
    startGame,
    grid,
    columnIndex,
    isTyping,
    rowIndex,
    freeze,
    showInfo,
    gameWon,
    isEnterPressed,
    isBackspacePressed,
    isShaking,
    cellStates,
    keyColors,
    clickedCell,
  } = state;

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getWord = async () => {
    try {
      let data = await axios.get(
        "https://random-word-api.herokuapp.com/word?length=5"
      );
      let word = data.data[0];
      await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      dispatch({ type: "SET_WORD", payload: word.toUpperCase() });
      console.log("Word Initialized");
    } catch {
      await getWord(); // All words from first API are not present in second API
    }
  };
  useEffect(() => {
    if (startGame === false) return;
    getWord();
    // eslint-disable-next-line
  }, [startGame]);
  useEffect(() => {
    if (freeze === true) setTimeout(() => dispatch({ type: "RESET" }), 8000);
  }, [freeze]);
  useEffect(() => homeRef.current?.focus(), [grid, startGame]);
  useEffect(() => {
    if (freeze) return;
    if (isEnterPressed !== true) return;

    let currentWord = grid[rowIndex].join("");

    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`)
      .then(() => {
        // Handle Valid Word
        let actualWord = word.split("");
        let letterColorMap = Array.from({ length: 5 }, () => "grey");

        for (let i = 0; i < currentWord.length; i++) {
          if (currentWord[i] === actualWord[i]) {
            letterColorMap[i] = "green";
            actualWord[i] = "$";
          }
        }
        for (let i = 0; i < currentWord.length; i++) {
          if (
            letterColorMap[i] !== "green" &&
            actualWord.includes(currentWord[i])
          ) {
            letterColorMap[i] = "orange";
            let index = actualWord.indexOf(currentWord[i]);
            actualWord[index] = "$";
          }
        }

        let countGreen = 0;
        for (let i = 0; i < currentWord.length; i++) {
          const color = letterColorMap[i];
          const letter = currentWord[i];

          setTimeout(() => {
            dispatch({
              type: "SET_CELL_STATE",
              payload: { row: rowIndex, col: i, color },
            });
            dispatch({
              type: "SET_KEY_COLOR",
              payload: { key: letter, color },
            });
          }, 450 * i);

          if (color === "green") countGreen++;
        }

        dispatch({ type: "SUBMIT_WORD" });
        if (rowIndex === 5 && columnIndex === 5)
          dispatch({ type: "SET_FREEZE", payload: true });
        if (countGreen === 5) {
          dispatch({ type: "GAME_WON" });
        }
      })
      .catch(() => {
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
      });
  }, [isEnterPressed]);
  useEffect(() => {
    if (freeze) return;
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
  const handleKeyDown = (key) => {
    if (freeze) return;
    const lettersPattern = /[A-Z]/;
    const enterPattern = /enter|{enter}/; // enter or  {enter}
    const backspacePattern = /backspace|{bksp}/; // backspace or {bksp}

    if (isTyping === false && key.toLowerCase().match(enterPattern) != null) {
      dispatch({ type: "SET_ENTER_PRESSED", payload: true });
    } else if (key.toLowerCase().match(backspacePattern))
      dispatch({ type: "SET_BACKSPACE_PRESSED", payload: true });
    else {
      if (
        isTyping === false ||
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
  };

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
