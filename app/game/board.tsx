'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const { ethers } = require('ethers');
const { CheckValidMove } = require('ui/wallet-ui/api/form');

export const Board = () => {
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);

  useEffect(() => {
    console.log('Moves updated:', moves);

    const callMoveVerification = async () => {
      try {
        let value = await CheckValidMove(moves);

        // setData(data);
      } catch (error) {
        console.error(error);
      }
    };
    callMoveVerification();
  }, [moves]);

  const makeAMove = (move: any) => {
    const gameMoves = game.fen();

    const gameCopy = new Chess();
    gameCopy.load(gameMoves);

    let result;
    try {
      result = gameCopy.move(move);
      setGame(gameCopy);
      let MoveString = move.from + move.to;
      setMoves([...moves, MoveString]);
    } catch {
      result = null;
      console.log('invalid move');
    }

    console.log(gameCopy.ascii());

    return result; // null if the move was illegal, the move object if the move was legal
  };

  const onDrop = (sourceSquare: any, targetSquare: any): boolean => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });

    // let value = await CheckValidMove(MoveString);
    console.log('HERE');
    // console.log(value);

    // illegal move
    if (move === null) return false;

    return true;
  };

  //return <Chessboard onPieceDrop={async (sourceSquare, targetSquare) => await onDrop(sourceSquare, targetSquare)} position={game.fen()} />;
  return <Chessboard onPieceDrop={onDrop} position={game.fen()} />;
};
