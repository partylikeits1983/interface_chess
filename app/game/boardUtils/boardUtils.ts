import { useState } from 'react';
import { Chess } from 'chess.js'; // Assuming you're using chess.js library

// If IMove is a type from an external module, don't forget to import it
import { IMove } from '../interfaces/interfaces';

import { moveExists } from './chessUtils';

// CLICK TO MOVE
export const BoardUtils = (
  game: any,
  setGame: Function,
  moves: any[],
  setMoves: Function,
  setGameFEN: Function,
  setLocalGame: Function,
  setMoveNumber: Function,
  setIsMoveInProgress: Function,
  setPlayerTurn: Function,
  handleSubmitMove: Function,
) => {
  const [optionSquares, setOptionSquares] = useState({});
  const [potentialMoves, setPotentialMoves] = useState<IMove[]>([]);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState('');
  const [moveSquares, setMoveSquares] = useState({});

  // MAKE A MOVE LOGIC
  const makeAMove = (move: any): [IMove | null, boolean] => {
    setIsMoveInProgress(true);

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
    setIsMoveInProgress(false);

    return [result, wasCaptured]; // null if the move was illegal, the move object if the move was legal
  };

  // ON SQUARE CLICK BOARD
  const onSquareClick = (square: any): void => {
    // Make a move
    setRightClickedSquares({});
    setMoveFrom('');
    setOptionSquares({});
    setPotentialMoves([]);

    function resetFirstMove(square: any) {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) setMoveFrom(square);
    }

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
    handleSubmitMove(moveString, wasCaptured);

    setPlayerTurn(false);
    setMoveFrom('');
    setOptionSquares({});
    setPotentialMoves([]);
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
  };
};
