import React, { useState } from "react";

function GuessInput({
  allSolutions,
  foundSolutions,
  correctAnswerCallback,
  difficulty
}) {
  const [labelText, setLabelText] = useState("Make your first guess!");
  const [input, setInput] = useState("");

  function getMinLength() {
    if (difficulty === "medium") return 4;
    if (difficulty === "hard") return 5;
    return 3;
  }

  function evaluateInput() {
    const minLength = getMinLength();

    const guess = input.trim().toLowerCase();

    const normalizedSolutions = allSolutions.map((word) =>
      word.trim().toLowerCase()
    );

    const normalizedFound = foundSolutions.map((word) =>
      word.trim().toLowerCase()
    );

    if (guess.length === 0) {
      setLabelText("Please enter a word.");
    } else if (guess.length < minLength) {
      setLabelText(`Word must be at least ${minLength} letters`);
    } else if (normalizedFound.includes(guess)) {
      setLabelText(`${guess} already found!`);
    } else if (normalizedSolutions.includes(guess)) {
      correctAnswerCallback(guess);
      setLabelText(`${guess} is correct!`);
    } else {
      setLabelText(`${guess} is incorrect!`);
    }
  }

  function keyPress(e) {
    if (e.key === "Enter") {
      evaluateInput();
      setInput("");
    }
  }

  return (
    <div>
      <div>{labelText}</div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={keyPress}
      />
    </div>
  );
}

export default GuessInput;