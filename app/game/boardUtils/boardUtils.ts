import { useState } from 'react';
import { Chess } from 'chess.js'; // Assuming you're using chess.js library

// If IMove is a type from an external module, don't forget to import it
import { IMove, ICard } from '../interfaces/interfaces';

import { moveExists } from './chessUtils';

import alertWarningFeedback from '#/ui/alertWarningFeedback';

const {
  CheckValidMove,
  GetGameMoves,
  PlayMove,
  GetPlayerTurn,
  GetNumberOfGames,
  GetWagerData,
  GetTimeRemaining,
  IsPlayerAddressWhite,
} = require('../../../lib/api/form');

import { useRouter } from 'next/navigation';

type Square =
  | 'a1'
  | 'a2'
  | 'a3'
  | 'a4'
  | 'a5'
  | 'a6'
  | 'a7'
  | 'a8'
  | 'b1'
  | 'b2'
  | 'b3'
  | 'b4'
  | 'b5'
  | 'b6'
  | 'b7'
  | 'b8'
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5'
  | 'c6'
  | 'c7'
  | 'c8'
  | 'd1'
  | 'd2'
  | 'd3'
  | 'd4'
  | 'd5'
  | 'd6'
  | 'd7'
  | 'd8'
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'g1'
  | 'g2'
  | 'g3'
  | 'g4'
  | 'g5'
  | 'g6'
  | 'g7'
  | 'g8'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'h7'
  | 'h8';

// CLICK TO MOVE
export const BoardUtils = (
  game: any,
  setGame: Function,
  moves: any[],
  setMoves: Function,
  setGameFEN: Function,
  setLocalGame: Function,
  setMoveNumber: Function,
  setPlayerTurn: Function,
  handleSubmitMove: Function,
) => {
  const [optionSquares, setOptionSquares] = useState({});
  const [potentialMoves, setPotentialMoves] = useState<IMove[]>([]);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState('');
  const [moveSquares, setMoveSquares] = useState({});
  const [wagerAddress, setWagerAddress] = useState('');

  const router = useRouter();

  // MAKE A MOVE LOGIC
  const makeAMove = (move: any): [IMove | null, boolean] => {
    const gameMoves = game.fen();
    const gameCopy = new Chess();
    gameCopy.load(gameMoves);

    let result;
    let wasCaptured = false;
    try {
      result = gameCopy.move(move);
      setGame(gameCopy);

      let MoveString = move.from + move.to;
      setMoves([...moves, MoveString]);
      setGameFEN(gameCopy.fen());
      setLocalGame(gameCopy);
      setMoveNumber(game.moves().length);

      if (result && result.captured) {
        wasCaptured = true;
      }
    } catch {
      result = null;
      console.log('Invalid move');
    }

    console.log(gameCopy.ascii());

    getLastMoveSourceSquare(gameCopy, gameCopy.history.length);

    return [result, wasCaptured]; // null if the move was illegal, the move object if the move was legal
  };

  function resetFirstMove(square: any) {
    const hasOptions = getMoveOptions(square);
    if (hasOptions) setMoveFrom(square);
  }

  // ON SQUARE CLICK BOARD
  const onSquareClick = (square: any, arePiecesDragable: boolean): void => {
    // Make a move
    if (arePiecesDragable === true) {

    setRightClickedSquares({});
    setMoveFrom('');
    setOptionSquares({});
    setPotentialMoves([]);

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // prevent error when clicking twice on same square
    if (moveFrom === square) {
      return;
    }

    if (!moveExists(potentialMoves, moveFrom, square)) {
      console.log("move doesn't exist");

      return;
    }

    // attempt to make move
    const gameMoves = game.fen();
    const gameCopy = new Chess();
    gameCopy.load(gameMoves);

    const [move, wasCaptured] = makeAMove({
      from: moveFrom,
      to: square,
      promotion: 'q', // always promote to a queen for example simplicity
    });

    // if invalid, setMoveFrom and getMoveOptions
    if (move === null) {
      resetFirstMove(square);
      return;
    }

    // calling smart contract to send tx
    const moveString = moveFrom + square;

    if (move != null) {
      handleSubmitMove(moveString, wasCaptured);
    }

    setPlayerTurn(false);
    setMoveFrom('');
    setOptionSquares({});
    setPotentialMoves([]);
  }
  };

  // GET MOVE OPTIONS ON CLICK
  function getMoveOptions(square: any) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      return false;
    }

    const newSquares: any = {};
    moves.map((move: IMove) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };

    setOptionSquares(newSquares);
    setPotentialMoves(moves);

    return true;
  }

  const handleBoardClick =
    (address: string) => async (e: React.MouseEvent<HTMLButtonElement>) => {
      // check if wager exists....
      const wager: ICard = await GetWagerData(address);

      // check if wager is not empty and not null
      if (wager && Object.keys(wager).length !== 0) {
        alertWarningFeedback(`Getting wager data: ${wager.matchAddress}`);
        e.preventDefault(); // This may be optional, depending on your needs
        router.push(`/game/${address}`);
      } else {
        alertWarningFeedback('ROUTER: Wager address not found');
      }
    };

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setWagerAddress(event.target.value);
  }

  const onDrop = (sourceSquare: any, targetSquare: any) => {
    setRightClickedSquares({});
    setMoveFrom('');
    setOptionSquares({});
    setPotentialMoves([]);

    const [move, wasCaptured] = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });

    const moveString = sourceSquare + targetSquare;

    // submit move to smart contract
    if (move != null) {
      handleSubmitMove(moveString, wasCaptured);
    }

    setPlayerTurn(false);

    // illegal move
    if (move === null) return false;

    return true;
  };

  async function getLastMoveSourceSquare(
    gameInstance: Chess,
    moveNumber: number,
  ) {
    // Obtain all past moves from the passed gameInstance
    const moves = gameInstance.history({ verbose: true });

    // If there are no moves, return false.
    if (moves.length === 0) {
      return false;
    }

    // Get the last move from the moves array
    const lastMove = moves[moveNumber];

    // If there's no last move (e.g., moveNumber exceeds the move history), return false.
    if (!lastMove) {
      return false;
    }

    const fromSquare = lastMove.from;
    const toSquare = lastMove.to;

    const highlightSquares: any = {};

    // Highlight the source square with a light green
    highlightSquares[fromSquare] = {
      background: 'rgba(144, 238, 144, 0.4)', // light green
    };

    // Highlight the destination square with a slightly darker green
    highlightSquares[toSquare] = {
      background: 'rgba(0, 128, 0, 0.4)', // darker green
    };

    // Check if the king is in check after the move
    if (gameInstance.inCheck()) {
      // Iterate over all squares to find the king
      const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      let kingPosition: Square | '' = '';

      for (const file of files) {
        for (const rank of ranks) {
          const square: Square = (file + rank) as Square;
          const piece = gameInstance.get(square);
          if (
            piece &&
            piece.type === 'k' &&
            piece.color === gameInstance.turn()
          ) {
            kingPosition = square;
            break;
          }
        }
        if (kingPosition) {
          // Highlight the king's square in red
          highlightSquares[kingPosition] = {
            background: 'rgba(255, 0, 0, 0.5)', // red
          };
          break;
        }
      }
    }

    setMoveSquares(highlightSquares);

    return { from: fromSquare, to: toSquare };
  }

  return {
    optionSquares,
    setOptionSquares,
    potentialMoves,
    setPotentialMoves,
    rightClickedSquares,
    setRightClickedSquares,
    moveFrom,
    setMoveFrom,
    moveSquares,
    setMoveSquares,
    makeAMove,
    onSquareClick,
    getMoveOptions,
    handleBoardClick,
    wagerAddress,
    setWagerAddress,
    handleChange,
    onDrop,
    getLastMoveSourceSquare,
  };
};
