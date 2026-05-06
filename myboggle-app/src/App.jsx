import React, { useState, useEffect } from "react";
import { GAME_STATE } from "./GameState";

import Board from "./Board";
import GuessInput from "./GuessInput";
import FoundSolutions from "./FoundSolutions";
import SummaryResults from "./SummaryResults";
import ToggleGameState from "./ToggleGameState";
import Leaderboard from "./Leaderboard";

function App() {
const [gameState, setGameState] = useState(GAME_STATE.BEFORE);
const [allSolutions, setAllSolutions] = useState([]);
const [foundSolutions, setFoundSolutions] = useState([]);
const [grid, setGrid] = useState([]);
const [size, setSize] = useState(3);
const [game, setGame] = useState({});

const [selectedTime, setSelectedTime] = useState(60);
const [timeLeft, setTimeLeft] = useState(60);

const [difficulty, setDifficulty] = useState("easy");
const [language, setLanguage] = useState("english");

const [leaderboardData, setLeaderboardData] = useState(null);
const [playerName, setPlayerName] = useState("");
const [hasSubmitted, setHasSubmitted] = useState(false);

// ✅ UPDATED BACKEND URL
const BASE_URL = "https://my-boggle-app.onrender.com";

// TIMER
useEffect(() => {
if (gameState === GAME_STATE.IN_PROGRESS && timeLeft > 0) {
const timer = setTimeout(() => {
setTimeLeft(timeLeft - 1);
}, 1000);

```
  return () => clearTimeout(timer);
}

if (timeLeft === 0 && gameState === GAME_STATE.IN_PROGRESS) {
  setGameState(GAME_STATE.ENDED);
}
```

}, [timeLeft, gameState]);

const resetSubmitState = () => {
setPlayerName("");
setHasSubmitted(false);
};

const startNewGame = async () => {
setGrid([]);
setGame({});
setFoundSolutions([]);
setAllSolutions([]);
setLeaderboardData(null);
resetSubmitState();
setTimeLeft(selectedTime);

```
try {
  const res = await fetch(
    `${BASE_URL}/api/game/${size}/?language=${language}`
  );

  const data = await res.json();

  localStorage.removeItem(`submitted_${data.id}`);

  setGame(data);
  setGrid(data.grid);
  setAllSolutions(data.solutions || data.solution_words || []);
  setGameState(GAME_STATE.IN_PROGRESS);
} catch (err) {
  console.error("Error starting game:", err);
  alert("Could not start game.");
}
```

};

const endGame = () => {
setGameState(GAME_STATE.ENDED);
};

function correctAnswerFound(answer) {
if (!foundSolutions.includes(answer)) {
setFoundSolutions([...foundSolutions, answer]);
}
}

function loadExistingGame(gameData) {
setGame(gameData);
setGrid(gameData.grid);
setFoundSolutions([]);
setLeaderboardData(null);
resetSubmitState();

```
localStorage.removeItem(`submitted_${gameData.id}`);

setAllSolutions(gameData.solutions || gameData.solution_words || []);
setTimeLeft(selectedTime);

if (gameData.dictionary_language) {
  setLanguage(gameData.dictionary_language.toLowerCase());
}

setGameState(GAME_STATE.IN_PROGRESS);
```

}

const fetchLeaderboard = async () => {
if (!game.id) return;

```
try {
  const res = await fetch(`${BASE_URL}/api/games/${game.id}/leaderboard/`);
  const data = await res.json();
  setLeaderboardData(data);
} catch (err) {
  console.error(err);
  alert("Could not load leaderboard.");
}
```

};

const submitScore = async () => {
const cleanedName = playerName.trim();

```
if (!game.id) {
  alert("No game selected.");
  return;
}

if (!cleanedName) {
  alert("Please enter your name.");
  return;
}

if (hasSubmitted) {
  alert("You already submitted!");
  return;
}

try {
  const response = await fetch(
    `${BASE_URL}/api/games/${game.id}/leaderboard/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_name: cleanedName,
        words_found_count: foundSolutions.length,
        total_time_seconds: selectedTime - timeLeft,
      }),
    }
  );

  if (!response.ok) throw new Error("Submit failed");

  localStorage.setItem(`submitted_${game.id}`, "true");
  setHasSubmitted(true);
  fetchLeaderboard();
} catch (error) {
  console.error(error);
  alert("Could not submit score.");
}
```

};

return (
<div style={{ textAlign: "center" }}> <h1>Boggle App</h1>

```
  {game.id && <p>Game ID: {game.id}</p>}

  {gameState === GAME_STATE.BEFORE && (
    <>
      <div>
        <label>Language: </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
        </select>
      </div>

      <div>
        <label>Timer: </label>
        <select
          value={selectedTime}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSelectedTime(val);
            setTimeLeft(val);
          }}
        >
          <option value={30}>30s</option>
          <option value={60}>60s</option>
          <option value={90}>90s</option>
          <option value={120}>120s</option>
        </select>
      </div>

      <div>
        <label>Difficulty: </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label>Grid Size: </label>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        >
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
        </select>
      </div>
    </>
  )}

  {gameState === GAME_STATE.IN_PROGRESS && (
    <h2>Time Left: {timeLeft}s</h2>
  )}

  <ToggleGameState
    gameState={gameState}
    onStartGame={startNewGame}
    onEndGame={endGame}
  />

  {gameState === GAME_STATE.BEFORE && (
    <Leaderboard onSelectGame={loadExistingGame} />
  )}

  <Board board={grid} />

  {gameState === GAME_STATE.IN_PROGRESS && (
    <>
      <GuessInput
        allSolutions={allSolutions}
        foundSolutions={foundSolutions}
        correctAnswerCallback={correctAnswerFound}
        difficulty={difficulty}
      />

      <FoundSolutions
        headerText="Correct Guesses"
        words={foundSolutions}
      />
    </>
  )}

  {gameState === GAME_STATE.ENDED && (
    <>
      <SummaryResults
        words={foundSolutions}
        totalTime={selectedTime - timeLeft}
      />

      <h2>Submit Your Score</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        disabled={hasSubmitted}
      />

      <button
        onClick={submitScore}
        disabled={hasSubmitted || !playerName.trim()}
      >
        {hasSubmitted ? "Submitted ✅" : "Submit Score"}
      </button>

      <button onClick={fetchLeaderboard}>View Leaderboard</button>

      {leaderboardData && (
        <div style={{ marginTop: "20px" }}>
          <h2>Leaderboard</h2>

          {leaderboardData.entries.length === 0 ? (
            <p>No entries yet.</p>
          ) : (
            <table border="1" cellPadding="10" style={{ margin: "0 auto" }}>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Words Found</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {[...leaderboardData.entries]
                  .sort((a, b) => {
                    if (b.words_found_count !== a.words_found_count) {
                      return (
                        b.words_found_count - a.words_found_count
                      );
                    }
                    return (
                      a.total_time_seconds -
                      b.total_time_seconds
                    );
                  })
                  .map((entry) => (
                    <tr key={entry.entry_id}>
                      <td>{entry.player_name}</td>
                      <td>{entry.words_found_count}</td>
                      <td>{entry.total_time_seconds}s</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <FoundSolutions headerText="Missed Words" words={allSolutions} />
    </>
  )}
</div>
```

);
}

export default App;
