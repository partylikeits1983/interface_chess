// import { CheckValidMove } from "../../api/form.ts";
'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

// const { ethers } = require("ethers");

// const { CheckValidMove } = require("src/api/form.ts")

export const Board = () => {
  const [game, setGame] = useState(new Chess());

  const makeAMove = (move: any) => {
    const gameMoves = game.fen();

    const gameCopy = new Chess();
    gameCopy.load(gameMoves);

    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result; // null if the move was illegal, the move object if the move was legal
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });
    console.log(game.fen());

    let MoveString = sourceSquare + targetSquare;
    console.log(MoveString);

    // let value = await CheckValidMove(MoveString);
    // console.log(value);
    // const signer = provider.getSigner();
    // console.log(signer.getAddress);

    // illegal move
    if (move === null) return false;

    return true;
  };

  return <Chessboard onPieceDrop={onDrop} position={game.fen()} />;
};
