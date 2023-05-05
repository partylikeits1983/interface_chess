'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const { ethers } = require('ethers');
const { CheckValidMove, GetGameMoves } = require('ui/wallet-ui/api/form');

import { Input, Box, Button, Flex, ChakraProvider } from '@chakra-ui/react';

export const Board = () => {
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);

  const [wagerAddress, setWagerAddress] = useState('');

  async function handleSubmit(): Promise<void> {
    const movesArray = await GetGameMoves(wagerAddress);

    const game = new Chess();

    for (let i = 0; i < movesArray.length; i++) {
      console.log(movesArray[i]);
      game.move(movesArray[i]);
    }

    console.log(game.fen());
    setGame(game);

    console.log(wagerAddress); // Replace with your function logic
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setWagerAddress(event.target.value);
  }

  useEffect(() => {
    const callMoveVerification = async () => {
      try {
        let value = await CheckValidMove(moves);

        console.log(value);
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

  const getPosition = async (wagerAddress: string) => {
    const moves = await GetGameMoves(wagerAddress);
    console.log(moves);
  };

  //return <Chessboard onPieceDrop={async (sourceSquare, targetSquare) => await onDrop(sourceSquare, targetSquare)} position={game.fen()} />;
  return (
    <ChakraProvider>
      <Chessboard onPieceDrop={onDrop} position={game.fen()} />
      <Box p={4}></Box>

      <Flex direction="column" alignItems="center">
        <Input
          value={wagerAddress}
          onChange={handleChange}
          placeholder="input wager address"
        ></Input>
        <Box p={2}></Box>
        <Button colorScheme="green" onClick={handleSubmit}>
          View Game
        </Button>
      </Flex>
    </ChakraProvider>
  );
};
