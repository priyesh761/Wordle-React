export const initialState = {
    grid: Array(6).fill().map(() => Array(5).fill(' ')),
    cellStates: Array(6).fill().map(() => Array(5).fill(null)),
    isShaking: Array(6).fill(false),
    keyColors: {},
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

export default function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, startGame: true };
    case 'SET_WORD':
      return { ...state, word: action.payload, isTyping: true };
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
        columnIndex: columnIndex + 1,
        isTyping: columnIndex < 4 // Stop typing when reaching column 4
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
        columnIndex: columnIndex - 1,
        isTyping: true
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
        isTyping: true,
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
    case 'SET_CELL_STATE': {
      const { row, col, color } = action.payload;
      const newCellStates = state.cellStates.map(r => [...r]);
      newCellStates[row][col] = color;
      return { ...state, cellStates: newCellStates };
    }
    case 'SET_KEY_COLOR': {
      const { key, color } = action.payload;
      // Only update if new color has higher priority (green > orange > grey)
      const colorPriority = { green: 3, orange: 2, grey: 1 };
      const currentColor = state.keyColors[key];
      if (currentColor && colorPriority[currentColor] >= colorPriority[color]) {
        return state;
      }
      return { ...state, keyColors: { ...state.keyColors, [key]: color } };
    }
    case 'SET_FREEZE':
      return { ...state, freeze: action.payload };
    case 'SET_GAME_WON':
      return { ...state, gameWon: action.payload, freeze: true };
    case 'TOGGLE_INFO':
      return { ...state, showInfo: !state.showInfo };
    case 'GAME_WON':
      return { ...state, gameWon: true, freeze: true };
    case 'GAME_LOST':
      return { ...state, freeze: true };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}