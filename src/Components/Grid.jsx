import React from "react";
import "../css/grid.css";

function Grid({ grid, isShaking, cellStates, clickedCell }) {
  return (
    <div className="grid col-12">
      <div className="grid-container">
        {grid.map((row, rindex) =>
          row.map((ele, cindex) => {
            const cellState = cellStates[rindex][cindex];
            const isClicked =
              clickedCell?.row === rindex && clickedCell?.col === cindex;
            return (
              <div
                key={rindex * 5 + cindex}
                className={`grid-item card-wrapper ${
                  isShaking[rindex] ? "shake" : ""
                } ${isClicked ? "clicked" : ""}`}
              >
                <div
                  className={`card-custom ${
                    cellState ? `flip ${cellState}` : ""
                  }`}
                >
                  <div className="front">{ele}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default React.memo(Grid);
