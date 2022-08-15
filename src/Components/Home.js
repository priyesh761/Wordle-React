import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/home.css';
import Grid from './Grid';
import Navbar from './Navbar';
import Spinner from './Spinner';
import Confetti from 'react-confetti'
import { default as Keyboard } from './Keyboard';

const initState = {
    grid: [[' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ']],
    rowIndex : 0,
    columnIndex : 0,
    isTyping : false,
    isEnterPressed : false,
    isBackspacePressed : false,
    word : null,
    freeze : false,
    startGame : false,
    showInfo : true,
    gameWon : null
}

function Home() {

    const [grid, setGrid] = useState(JSON.parse(JSON.stringify(initState.grid)));
    const [rowIndex, setRowIndex] = useState(initState.rowIndex);
    const [columnIndex, setColumnIndex] = useState(initState.columnIndex);
    const [isTyping, setIsTyping] = useState(initState.isTyping);
    const [isEnterPressed, setIsEnterPressed] = useState(initState.isEnterPressed);
    const [isBackspacePressed, setBackspacePressed] = useState(initState.isBackspacePressed);
    const [word, setWord] = useState(initState.word);
    const [freeze, setFreeze] = useState(initState.freeze);
    const [startGame, setStartGame] = useState(initState.startGame);
    const [showInfo, setShowInfo] = useState(initState.showInfo);
    const [gameWon, setGameWon] = useState(initState.gameWon);

    const setInitState = () => {
        setGrid(JSON.parse(JSON.stringify(initState.grid)));
        setRowIndex(initState.rowIndex);
        setColumnIndex(initState.columnIndex);
        setIsTyping(initState.isTyping);
        setIsEnterPressed(initState.isEnterPressed);
        setBackspacePressed(initState.isBackspacePressed);
        setWord(initState.null);
        setFreeze(initState.freeze);
        setStartGame(initState.startGame);
        setShowInfo(initState.showInfo);
        setGameWon(initState.gameWon);
    }  
    const getWord = async () => {
        try {
            let data = await axios.get('https://random-word-api.herokuapp.com/word?length=5');
            let word = data.data[0];
            await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            setWord(word.toUpperCase());
            setIsTyping(true);
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
            setTimeout(()=>{
                setInitState();
            }, 8000)
    }, [freeze])
    useEffect(() => {
        if(freeze) return;
        if (isEnterPressed !== true) return;
        console.log("enter");

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

                // Handle index
                if (rowIndex < 5) setIsTyping(true);
                setColumnIndex(() => rowIndex === 5 ? columnIndex : 0);
                setRowIndex(rowIndex => rowIndex === 5 ? rowIndex : rowIndex + 1);

                if(rowIndex===5&&columnIndex===5) setFreeze(true);
                if(countGreen===5){ 
                    setGameWon(true);
                    setFreeze(true);
                }
                console.log('updated');
            })
            .catch((err) => {
                console.log(err);
                document.querySelectorAll(`[data-row="${rowIndex}"]`)
                    .forEach(ele => {
                        ele.classList.add('shake');
                        setTimeout(() => { ele.classList.remove('shake') }, 1000);
                    });
                return;
            }).finally(() => {
                setIsEnterPressed(false);
            });
        // eslint-disable-next-line
    }, [isEnterPressed]);
    useEffect(() => {
        if(freeze) return;
        if (isBackspacePressed === false) return;
        console.log("backspace");
        setIsTyping(true);
        
        setColumnIndex(columnIndex => {
            if (columnIndex === 0)
                return columnIndex;
            setGrid(grid => {
                //current column index points to fist " " so columnIndex-1 points to last alphabet
                grid[rowIndex][columnIndex - 1] = " ";
                const selector = `[data-row="${rowIndex}"][data-column="${columnIndex - 1}"]`;
                document.querySelector(selector).classList.add('clicked');
                setTimeout(() => { document.querySelector(selector).classList.remove('clicked') }, 500);
                return grid;
            });
            return columnIndex - 1
        });

        setBackspacePressed(false);

        // eslint-disable-next-line
    }, [isBackspacePressed]);
    const handleKeyDown = (key) => {
        if(freeze) return;
        const lettersPattern = /[A-Z]/;
        const enterPattern = /enter|{enter}/;                 // enter or  {enter}
        const backspacePattern = /backspace|{bksp}/;           // backspace or {bksp}
        console.log(key.toLowerCase());
        
        if (isTyping === false && key.toLowerCase().match(enterPattern) != null) {
            setIsEnterPressed(true);
        } else if (key.toLowerCase().match(backspacePattern))
            setBackspacePressed(true);
        else {
            if (isTyping === false || key.length !== 1 || key.match(lettersPattern) == null) return;
            console.log(key);

            setGrid(grid => {
                if (rowIndex < grid.length && columnIndex < grid[rowIndex].length && columnIndex >= 0) {
                    grid[rowIndex][columnIndex] = key.toUpperCase();
                    const selector = `[data-row="${rowIndex}"][data-column="${columnIndex}"]`;
                    document.querySelector(selector).classList.add('clicked');
                    setTimeout(() => { document.querySelector(selector).classList.remove('clicked') }, 500);
                }

                return grid;
            })
            setColumnIndex(colInd => {
                if (colInd === 4)
                    setIsTyping(false);
                return colInd + 1;
            });
            console.log(rowIndex, columnIndex);
        }
    };

    return (
        <div id="home" className='container-fluid justify-content-around' tabIndex={0} onKeyDown={(e) => handleKeyDown(e.key.toUpperCase())}>
            <header className='row'>
                <Navbar startGame={startGame} setStartGame={setStartGame} showInfo={showInfo} setShowInfo={setShowInfo}/>
            </header>
            {(startGame===false || word == null) && <Spinner />}
            {startGame===true && word != null &&
                <main className='row justify-content-center' >
                    <Grid grid={grid} rowIndex={rowIndex} columnIndex={columnIndex} />
                    <Keyboard setGrid={setGrid} handleKeyDown={handleKeyDown} />
                </main>
            }
            { gameWon && <Confetti />}
        </div>

    );
}

export default Home;