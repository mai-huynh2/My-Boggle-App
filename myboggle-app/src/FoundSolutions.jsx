import React from "react";

function FoundSolutions({ words, headerText }) {
  return (
    <div>
      {words.length > 0 && (
        <h4>{headerText}: {words.length}</h4>
      )}

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {words.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}

export default FoundSolutions;