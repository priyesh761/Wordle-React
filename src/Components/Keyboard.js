import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "../css/keyboard.css"

const layout = {
  'default': [
    'Q W E R T Y U I O P',
    'A S D F G H J K L',
    '{enter} Z X C V B N M {bksp}'
  ]
}

const display = {
  '{bksp}': 'Backspace',
  '{enter}': 'Enter',
}

function keyboard({handleKeyDown}) {
  return (
    <div className="keyboard">
      <Keyboard
        theme={"hg-theme-default myTheme1"}
        layout={layout}
        display={display}
        onKeyReleased ={button => handleKeyDown(button)}
      />
    </div>
  );
}

export default keyboard;