import { useEffect } from 'react';
import { Chess } from 'chess.js'; // Assuming 'chess.js' is the library you're using

interface UseGameControlsProps {
  hasGameInitialized: boolean;
  moveNumber: number;
  numberOfGames: number;
  game: Chess;
  setGameID: React.Dispatch<React.SetStateAction<number>>;
  setNumberOfGamesInfo: React.Dispatch<React.SetStateAction<string>>;
  setMoveNumber: React.Dispatch<React.SetStateAction<number>>;
  setGameFEN: React.Dispatch<React.SetStateAction<string>>;
  getLastMoveSourceSquare: (game: Chess, moveNumber: number) => void;
}

const BackAndForwardGameControls = ({
  hasGameInitialized,
  moveNumber,
  numberOfGames,
  game,
  setGameID,
  setNumberOfGamesInfo,
  setMoveNumber,
  setGameFEN,
  getLastMoveSourceSquare,
}: UseGameControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key);
      switch (event.key) {
        case 'ArrowLeft':
          handleBackMove();
          break;
        case 'ArrowRight':
          handleForwardMove();
          break;
        default:
          break;
      }
    };

    if (hasGameInitialized) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (hasGameInitialized) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [hasGameInitialized, moveNumber]);

  const handleBackGame = () => {
    setGameID((prevGameID) => {
      const newGameID = prevGameID > 0 ? prevGameID - 1 : prevGameID;
      const gameNumberInfo = `${newGameID + 1} of ${numberOfGames}`;
      setNumberOfGamesInfo(gameNumberInfo);
      return newGameID;
    });
  };

  const handleForwardGame = () => {
    setGameID((prevGameID) => {
      const newGameID =
        prevGameID < numberOfGames - 1 ? prevGameID + 1 : prevGameID;
      const gameNumberInfo = `${newGameID + 1} of ${numberOfGames}`;
      setNumberOfGamesInfo(gameNumberInfo);
      return newGameID;
    });
  };

  const handleBackMove = () => {
    const moves = game.history();
    const tempGame = new Chess();

    if (moveNumber >= 0) {
      const newMoveNumber = moveNumber - 1;
      setMoveNumber(newMoveNumber);
      for (let i = 0; i <= newMoveNumber; i++) {
        tempGame.move(moves[i]);
      }
      setGameFEN(tempGame.fen());
      getLastMoveSourceSquare(tempGame, newMoveNumber);
    }
  };

  const handleForwardMove = () => {
    const moves = game.history();
    const tempGame = new Chess();

    if (moveNumber < moves.length - 1) {
      const newMoveNumber = moveNumber + 1;
      setMoveNumber(newMoveNumber);
      for (let i = 0; i <= newMoveNumber; i++) {
        tempGame.move(moves[i]);
      }
      setGameFEN(tempGame.fen());
      getLastMoveSourceSquare(tempGame, newMoveNumber);
    }
  };

  return {
    handleBackGame,
    handleForwardGame,
    handleBackMove,
    handleForwardMove,
  };
};

export default BackAndForwardGameControls;
