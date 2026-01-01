import React, { useEffect, useState, useReducer } from 'react';
import axios from 'axios';
import '../css/home.css';
import Grid from './Grid';
import Navbar from './Navbar';
import Spinner from './Spinner';
import Confetti from 'react-confetti'
import { default as Keyboard } from './Keyboard';
import gameReducer, {initialState} from '../reducers/gameReducer';

function Home() {

    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { word, startGame, grid, columnIndex, isTyping, rowIndex, freeze, showInfo, gameWon, isEnterPressed, isBackspacePressed, isShaking } = state;

    const [windowDimensions, setWindowDimensions] = useState({ 
        width: window.innerWidth, 
        height: window.innerHeight 
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getWord = async () => {
        try {
            let data = await axios.get('https://random-word-api.herokuapp.com/word?length=5');
            let word = data.data[0];
            await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            dispatch({ type: 'SET_WORD', payload: word.toUpperCase() });
            console.log("Word Initialized");
        } catch {
            await getWord(); // All words from first API are not present in second API
        }
    }
    useEffect(() => {
        if(startGame===false) return;
        getWord();   
        // eslint-disable-next-line
    }, [startGame]);
    useEffect(()=>{
        if(freeze===true)
            setTimeout(()=> dispatch({ type: 'RESET' }), 8000)
    }, [freeze])
    useEffect(() => {
        if(freeze) return;
        if (isEnterPressed !== true) return;
        //console.log("enter");

        let currentWord = grid[rowIndex].join('');

        axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`)
            .then(() => {

                // Handle Valid Word
                let actualWord = word.split('');
                let letterColorMap = ['', '', '', '', ''];

                for (let i = 0; i < currentWord.length; i++) {
                    if (currentWord[i] === actualWord[i]) {
                        letterColorMap[i] = 'GREEN';
                        actualWord[i] = '$';
                    }
                }
                for (let i = 0; i < currentWord.length; i++) {
                    if (actualWord.includes(currentWord[i].toString())) {
                        letterColorMap[i] = "ORANGE";
                        let index = actualWord.indexOf(`${currentWord[i]}`);
                        actualWord[index] = '$';
                    }
                }
                for (let i = 0; i < currentWord.length; i++) {
                    if (word.includes(currentWord[i].toString()) === false) {
                        letterColorMap[i] = "GREY";
                    }
                }

                let countGreen = 0;
                for (let i = 0; i < currentWord.length; i++) {
                    const selector = `[data-row="${rowIndex}"][data-column="${i}"] > .card-custom`;
                    const keySelector = `[data-skbtn="${currentWord[i]}"`;
                    let item = document.querySelector(selector);
                    let key = document.querySelector(keySelector);

                    switch (letterColorMap[i]) {
                        case "GREEN":                               // same letter at current index 
                            setTimeout(() => {
                                item.classList.add('flip');
                                item.classList.add('green');
                                key.classList.add('green');
                            }, 450 * i);
                            countGreen++;
                            break;

                        case "ORANGE":                              // letter in word excluding repetition
                            setTimeout(() => {
                                item.classList.add('flip');
                                item.classList.add('orange');
                                key.classList.add('orange');
                            }, 450 * i);
                            break;

                        case "GREY":                                // letter not present in word
                            setTimeout(() => {
                                item.classList.add('flip');
                                item.classList.add('grey');
                                key.classList.add('grey');
                            }, 450 * i);
                            break;

                        default:                                    // letter present in word but repeated more than its actual occurence
                            setTimeout(() => {
                                item.classList.add('flip');
                                item.classList.add('grey')
                            }, 450 * i);

                    }
                }

                dispatch({ type: 'SUBMIT_WORD' });
                if(rowIndex===5&&columnIndex===5) dispatch({ type: 'SET_FREEZE', payload: true });
                if(countGreen===5){ 
                    dispatch({ type: 'GAME_WON' });
                }
            })
            .catch(() => {
                dispatch({ type: 'SET_ROW_SHAKING', payload: { row: rowIndex, value: true } });
                setTimeout(() => {
                    dispatch({ type: 'SET_ROW_SHAKING', payload: { row: rowIndex, value: false } });
                }, 1000);
                dispatch({ type: 'SET_ENTER_PRESSED', payload: false });
                return;
            });
    }, [isEnterPressed]);
    useEffect(() => {
        if(freeze) return;
        if (isBackspacePressed === false) return;
    dispatch({ type: 'DELETE_LETTER' });
        
        if (columnIndex > 0) {
            const selector = `[data-row="${rowIndex}"][data-column="${columnIndex - 1}"]`;
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('clicked');
                setTimeout(() => { element.classList.remove('clicked') }, 500);
            }
        }

        dispatch({ type: 'SET_BACKSPACE_PRESSED', payload: false });
    }, [isBackspacePressed]);
    const handleKeyDown = (key) => {
        if(freeze) return;
        const lettersPattern = /[A-Z]/;
        const enterPattern = /enter|{enter}/;                 // enter or  {enter}
        const backspacePattern = /backspace|{bksp}/;           // backspace or {bksp}
        
        if (isTyping === false && key.toLowerCase().match(enterPattern) != null) {
            dispatch({ type: 'SET_ENTER_PRESSED', payload: true });
        } else if (key.toLowerCase().match(backspacePattern))
            dispatch({ type: 'SET_BACKSPACE_PRESSED', payload: true });
        else {
            if (isTyping === false || key.length !== 1 || key.match(lettersPattern) == null) return;
            dispatch({ type: 'TYPE_LETTER', payload: key.toUpperCase() });
            const selector = `[data-row="${rowIndex}"][data-column="${columnIndex}"]`;
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('clicked');
                setTimeout(() => { element.classList.remove('clicked') }, 500);
            }
        }
    };

    return (
        <div id="home" className='container-fluid justify-content-around' tabIndex={0} onKeyDown={(e) => handleKeyDown(e.key.toUpperCase())}>
            <header className='row'>
                <Navbar startGame={startGame} setStartGame={() => dispatch({ type: 'START_GAME' })} showInfo={showInfo} setShowInfo={() => dispatch({ type: 'TOGGLE_INFO' })}/>
            </header>
            {(startGame===false || word == null) && <Spinner />}
            {startGame===true && word != null &&
                <main className='row justify-content-center' >
                    <Grid grid={grid} isShaking={isShaking} />
                    <Keyboard handleKeyDown={handleKeyDown} />
                </main>
            }
            { gameWon && <Confetti width={windowDimensions.width} height={windowDimensions.height} />}
        </div>

    );
}

export default Home;