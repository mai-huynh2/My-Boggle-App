import React from "react";

function Board({ board }) {
  if (!board || board.length === 0) {
    return null;
  }

  return (
    <div>
      {board.map((row, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          {row.map((cell, j) => (
            <div
              key={j}
              style={{
                border: "2px solid black",
                padding: "15px",
                margin: "3px",
                width: "50px",
                height: "50px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;