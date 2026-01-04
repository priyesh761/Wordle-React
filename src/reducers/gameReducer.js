export const initialState = {
    grid: Array(6).fill().map(() => Array(5).fill(' ')),
    cellStates: Array(6).fill().map(() => Array(5).fill(null)),
    isShaking: Array(6).fill(false),
    keyColors: {},
    clickedCell: null,
    rowIndex : 0,
    columnIndex : 0,
    isEnterPressed : false,
    isBackspacePressed : false,
    word : null,
    startGame : false,
    showInfo : true,
    gameWon : null,
    error: null
}

export default function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, startGame: true };
    case 'SET_WORD':
      return { ...state, word: action.payload };
    case 'TYPE_LETTER': {
      const { rowIndex, columnIndex, grid } = state;
      if (rowIndex >= grid.length || columnIndex >= grid[rowIndex].length || columnIndex < 0) {
        return state;
      }
      const newGrid = grid.map(row => [...row]);
      newGrid[rowIndex][columnIndex] = action.payload;
      return { 
        ...state, 
        grid: newGrid,
        columnIndex: columnIndex + 1
      };
    }
    case 'DELETE_LETTER': {
      const { rowIndex, columnIndex, grid } = state;
      if (columnIndex === 0) {
        return state;
      }
      const newGrid = grid.map(row => [...row]);
      newGrid[rowIndex][columnIndex - 1] = ' ';
      return { 
        ...state, 
        grid: newGrid,
        columnIndex: columnIndex - 1
      };
    }
    case 'SUBMIT_WORD': {
      const { rowIndex } = state;
      if (rowIndex >= 5) {
        return state; // Last row, can't submit more
      }
      return { 
        ...state, 
        rowIndex: rowIndex + 1,
        columnIndex: 0,
        isEnterPressed: false
      };
    }
    case 'SET_ENTER_PRESSED':
      return { ...state, isEnterPressed: action.payload };
    case 'SET_BACKSPACE_PRESSED':
      return { ...state, isBackspacePressed: action.payload };
    case 'SET_ROW_SHAKING': {
      const { row, value } = action.payload;
      const newIsShaking = [...state.isShaking];
      newIsShaking[row] = value;
      return { ...state, isShaking: newIsShaking };
    }
    case 'SET_LETTER_FEEDBACK': {
      const { row, col, color, key } = action.payload;
      // Update cell state
      const newCellStates = state.cellStates.map(r => [...r]);
      newCellStates[row][col] = color;
      // Update key color (with priority check)
      const colorPriority = { green: 3, orange: 2, grey: 1 };
      const currentColor = state.keyColors[key];
      const newKeyColors = (currentColor && colorPriority[currentColor] >= colorPriority[color])
        ? state.keyColors
        : { ...state.keyColors, [key]: color };
      return { ...state, cellStates: newCellStates, keyColors: newKeyColors };
    }
    case 'SET_CLICKED_CELL':
      return { ...state, clickedCell: action.payload };
    case 'TOGGLE_INFO':
      return { ...state, showInfo: !state.showInfo };
    case 'GAME_OVER':
      return { ...state, gameWon: action.payload.won };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}