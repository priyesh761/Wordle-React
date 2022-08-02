import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../css/home.css';
import Grid from './Grid';
import { default as Keyboard } from './Keyboard';

function Home() {

    const [grid, setGrid] = useState([[' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ']]);
    const [rowIndex, setRowIndex] = useState(0);
    const [columnIndex, setColumnIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [isEnterPressed, setIsEnterPressed] = useState(false);
    const [isBackspacePressed, setBackspacePressed] = useState(false);
    const [word, setWord] = useState("");
    const container = useRef(null);

    useEffect(() => {
        axios.get('https://random-word-api.herokuapp.com/word?length=5').then(data => setWord(data.data[0].toUpperCase()));
    }, []);
    useEffect(() => { container.current.focus() }, [word]);
    useEffect(() => {
        if (isEnterPressed !== true) return;
        console.log("enter");
        
        let currentWord = grid[rowIndex].join('');

        axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`)
        .then(()=>{
            
            // Handle Valid Word
            let actualWord = word.split('');
            let letterColorMap = ['', '', '','',''];

            for (let i = 0; i < currentWord.length; i++){
                if (currentWord[i] === actualWord[i]){
                    letterColorMap[i] = 'GREEN';
                    actualWord[i] = '$';
                }
            }
            for (let i = 0; i < currentWord.length; i++){
                if (actualWord.includes(currentWord[i].toString())) {
                    letterColorMap[i] = "ORANGE";
                    let index = actualWord.indexOf(`${currentWord[i]}`);
                    actualWord[index] = '$';
                }
            }
            for (let i = 0; i < currentWord.length; i++){
                if (word.includes(currentWord[i].toString())===false) {
                    letterColorMap[i] = "GREY";
                }
            }
            
            for (let i = 0; i < currentWord.length; i++){
                const selector = `[data-row="${rowIndex}"][data-column="${i}"] > .card`;
                const keySelector = `[data-skbtn="${currentWord[i]}"`;
                let item = document.querySelector(selector);
                let key = document.querySelector(keySelector);
            
                switch(letterColorMap[i]){
                    case "GREEN":                               // same letter at current index 
                        setTimeout(()=>{ 
                            item.classList.add('green');
                            key.classList.add('green');
                        },450*i);
                        break;

                    case "ORANGE":                              // letter in word excluding repetition
                        setTimeout(()=>{ 
                            item.classList.add('orange');
                            key.classList.add('orange');
                        },450*i);
                        break;

                    case "GREY":                                // letter not present in word
                        setTimeout(()=>{ 
                            item.classList.add('grey');
                            key.classList.add('grey');
                        },450*i);
                        break;

                    default:                                    // letter present in word but repeated more than its actual occurence
                        setTimeout(()=> {item.classList.add('grey')},450*i);
                
                }
            }

/*
            for (let i = 0; i < currentWord.length; i++){ 
                const selector = `[data-row="${rowIndex}"][data-column="${i}"] > .card`;
                const keySelector = `[data-skbtn="${actualWord[i]}"`;
                if (currentWord[i] === actualWord[i]) {
                    let item = document.querySelector(selector);
                    let key = document.querySelector(keySelector);
                    setTimeout(()=>{
                        item.classList.add('green');
                        key.classList.add('green');
                    },450*i);
                    actualWord[i] = '$';
                    console.log("green");
                }
            }
            for (let i = 0; i < currentWord.length; i++) {                
                const selector = `[data-row="${rowIndex}"][data-column="${i}"] > .card`;
                const keySelector = `[data-skbtn="${actualWord[i]}"`;
                let item = document.querySelector(selector);
                let key = document.querySelector(keySelector);
                setTimeout(()=> item.classList.add('flip'),450*i);
                if (actualWord.includes(currentWord[i].toString())) {
                    setTimeout(()=>{ 
                        item.classList.add('orange');
                        key.classList.add('orange');
                    },450*i);
                    let index = actualWord.indexOf(`${currentWord[i]}`);
                    actualWord[index] = '$';
                    console.log("orange");
                }else if(actualWord[i]!=='$'){
                    setTimeout(()=> item.classList.add('grey'),450*i);
                }
            } 
*/

            // Handle index
            if (rowIndex < 5) setIsTyping(true);
            setRowIndex(rowIndex => rowIndex === 5 ? rowIndex : rowIndex + 1);
            setColumnIndex(() => rowIndex === 5 ? columnIndex : 0);
            console.log('updated');
        })
        .catch((err)=>{
            console.log(err);
            document.querySelectorAll(`[data-row="${rowIndex}"]`)
                    .forEach(ele => {
                        ele.classList.add('shake');
                        setTimeout(() => { ele.classList.remove('shake') }, 1000);
                    });
            return;
        }).finally(()=>{
            setIsEnterPressed(false);
        });

    }, [isEnterPressed]);

    useEffect(() => {
        setIsTyping(true);
        if (isBackspacePressed) {
            console.log("backspace");

            setColumnIndex(columnIndex => {
                if (columnIndex === 0)
                    return columnIndex;
                setGrid(grid => {
                    //current column index points to fist " " so columnIndex-1 points to last alphabet
                    grid[rowIndex][columnIndex - 1] = " ";
                    document.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex-1}"]`).classList.add('clicked');
                    setTimeout(()=>{document.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex-1}"]`).classList.remove('clicked')}, 500);
                    console.log(grid);
                    return grid;
                });
                return columnIndex - 1
            });

            setBackspacePressed(false);
        }
    }, [isBackspacePressed]);


    const handleKeyDown = (key) => {
        const lettersPattern = /[A-Z]/;
        const enterPattern = /enter/;                 // enter or  {enter}
        const backspacePattern = /^b.*k.*s.*p/;           // backspace or {bksp}
        console.log(key.toLowerCase());
        if (isTyping === false && key.toLowerCase().match(enterPattern) != null) {
            setIsEnterPressed(true);
        } else if (key.toLowerCase().match(backspacePattern))
            setBackspacePressed(true);
        else {
            if (isTyping === false || key.length !== 1 || key.match(lettersPattern) == null) return;
            console.log(key);

            setGrid(grid => {
                if (rowIndex < grid.length && columnIndex < grid[rowIndex].length && columnIndex >= 0){
                    grid[rowIndex][columnIndex] = key.toUpperCase();
                    document.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex}"]`).classList.add('clicked');
                    setTimeout(()=>{document.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex}"]`).classList.remove('clicked')}, 500);
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


    if (word == null) return "loading";
    return (
        <div>
            {word == null && <span>Loading...</span>}
            {word != null &&
                <div ref={container} className='container' tabIndex={0} onKeyDown={(e) => handleKeyDown(e.key.toUpperCase())}>
                    <header>
                        <h1>Custom Wordle-{word}</h1>
                    </header>
                    <main className='main' >
                        <Grid grid={grid} rowIndex={rowIndex} columnIndex={columnIndex} />
                        <Keyboard setGrid={setGrid} handleKeyDown={handleKeyDown} />
                    </main>
                </div>
            }
        </div>
    );
}

export default Home;