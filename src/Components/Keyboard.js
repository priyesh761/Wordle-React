import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "../css/keyboard.css"

const layout = {
  'default': [
    'Q W E R T Y U I O P',
    'A S D F G H J K L',
    '{bksp} Z X C V B N M {enter}'
  ]
}

const display = {
  '{bksp}': 'Backspace',
  '{enter}': 'Enter',
}

function keyboard({handleKeyDown}) {
  return (
    <div className="keyboard col-12 col-md-8">
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