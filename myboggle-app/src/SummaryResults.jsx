import React from "react";

function SummaryResults({ words, totalTime }) {
  return (
    <div>
      <h2>SUMMARY</h2>
      <p>Total Words Found: {words.length}</p>
      <p>Total Time: {totalTime} seconds</p>
    </div>
  );
}

export default SummaryResults;