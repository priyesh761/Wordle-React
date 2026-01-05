import React, { useMemo } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "../css/keyboard.css";

const layout = {
  default: [
    "Q W E R T Y U I O P",
    "A S D F G H J K L",
    "{bksp} Z X C V B N M {enter}",
  ],
};

const display = {
  "{bksp}": "Backspace",
  "{enter}": "Enter",
};

function KeyboardComponent({ handleKeyDown, keyColors = {} }) {
  const buttonTheme = useMemo(() => {
    const allButtons = layout.default.join(" ").split(" ");

    const grouped = Object.entries(
      allButtons.reduce(
        (acc, button) => {
          acc["wordle-key"].push(button);
          const color = keyColors[button];
          if (color) acc[`key-${color}`].push(button);
          return acc;
        },
        { "wordle-key": [], "key-green": [], "key-orange": [], "key-grey": [] }
      )
    ).filter(([, buttons]) => buttons.length);

    return grouped.map(([cls, buttons]) => ({
      class: cls,
      buttons: buttons.join(" "),
    }));
  }, [keyColors]);

  return (
    <div className="m-1 col-12 col-md-8">
      <Keyboard
        baseClass="wordle-keyboard"
        theme={"hg-theme-default wordle-theme"}
        layout={layout}
        display={display}
        onKeyReleased={(button) => handleKeyDown(button)}
        buttonTheme={buttonTheme}
      />
    </div>
  );
}

export default React.memo(KeyboardComponent);
