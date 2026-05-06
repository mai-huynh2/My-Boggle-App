import React, { useState } from "react";

function Leaderboard({ onSelectGame }) {
  const [games, setGames] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [show, setShow] = useState(false);

  const BASE_URL = "https://chanceenjoy-cubaperfect-8000.codio.io";

  async function loadChallenges() {
    try {
      const res = await fetch(`${BASE_URL}/api/games/`);
      const data = await res.json();

      setGames(data);
      setShow(true);

      // fetch leaderboard for each game
      data.forEach(async (game) => {
        try {
          const res2 = await fetch(
            `${BASE_URL}/api/games/${game.id}/leaderboard/`
          );
          const lb = await res2.json();

          setLeaderboards((prev) => ({
            ...prev,
            [game.id]: lb.entries || [],
          }));
        } catch (err) {
          console.error("Leaderboard error:", err);
        }
      });
    } catch (err) {
      console.error("Games fetch error:", err);
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={loadChallenges}>Load Challenge</button>

      {show &&
        games.map((game) => {
          const entries = leaderboards[game.id] || [];

          let topPlayer = "None";
          let highScore = 0;

          if (entries.length > 0) {
            const best = [...entries].sort((a, b) => {
              if (b.words_found_count !== a.words_found_count) {
                return b.words_found_count - a.words_found_count;
              }
              return a.total_time_seconds - b.total_time_seconds;
            })[0];

            // ✅ FIXED FIELD NAME HERE
            topPlayer = best.player_name || "Unknown";
            highScore = best.words_found_count;
          }

          return (
            <div
              key={game.id}
              style={{
                margin: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <p><strong>Game ID:</strong> {game.id}</p>
              <p><strong>Top Player:</strong> {topPlayer}</p>
              <p><strong>High Score:</strong> {highScore}</p>

              <button onClick={() => onSelectGame(game)}>
                Load This Game
              </button>
            </div>
          );
        })}
    </div>
  );
}

export default Leaderboard;