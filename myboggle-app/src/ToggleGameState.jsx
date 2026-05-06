import { GAME_STATE } from "./GameState";

function ToggleGameState({ gameState, onStartGame, onEndGame }) {
  if (gameState === GAME_STATE.BEFORE) {
    return <button onClick={onStartGame}>Start a new game!</button>;
  }

  if (gameState === GAME_STATE.IN_PROGRESS) {
    return <button onClick={onEndGame}>End Game</button>;
  }

  if (gameState === GAME_STATE.ENDED) {
    return <button onClick={() => window.location.reload()}>Play Again</button>;
  }

  return null;
}

export default ToggleGameState;