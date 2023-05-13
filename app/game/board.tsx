'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const { ethers } = require('ethers');

const {
  CheckValidMove,
  GetGameMoves,
  PlayMove,
  IsPlayerWhite,
  GetPlayerTurn,
  GetNumberOfGames,
} = require('ui/wallet-ui/api/form');

import {
  Input,
  Box,
  Button,
  Flex,
  Text,
  Spinner,
  Center,
  ChakraProvider,
} from '@chakra-ui/react';

interface BoardProps {
  wager: string;
}

export const Board: React.FC<BoardProps> = ({ wager }) => {
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);

  const [wagerAddress, setWagerAddress] = useState('');
  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [numberOfGames, setNumberOfGames] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const myAsyncFunction = async () => {
      if (wager != '') {
        setWagerAddress(wager);

        const isPlayerTurn = await GetPlayerTurn(wager);
        setPlayerTurn(isPlayerTurn);

        // Your async function logic here
        const movesArray = await GetGameMoves(wager);
        const game = new Chess();

        for (let i = 0; i < movesArray.length; i++) {
          console.log(movesArray[i]);
          game.move(movesArray[i]);
        }
        setGame(game);

        const isPlayerWhite = await IsPlayerWhite(wager);
        setPlayerColor(isPlayerWhite);

        const gameNumberData: Array<Number> = await GetNumberOfGames(wager);
        const gameNumber = `${gameNumberData[0]} of ${gameNumberData[1]}`;
        setNumberOfGames(gameNumber);

        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    myAsyncFunction();
  }, [wager]);

  // Check valid move with sc
  useEffect(() => {
    const callMoveVerification = async () => {
      try {
        await CheckValidMove(moves);
      } catch (error) {
        console.error(error);
      }
    };
    callMoveVerification();
  }, [moves]);

  function handleSubmitMove(move: any): void {
    try {
      // adding await fails to build
      // using useEffect makes everything glitchy
      console.log('handlesubmit move');
      console.log(wagerAddress);
      PlayMove(wagerAddress, move);
    } catch (error) {
      console.log(error);
    }
  }

  // Get Game State after clicking view game button
  async function handleSubmit(): Promise<void> {
    setLoading(true);

    const movesArray = await GetGameMoves(wagerAddress);
    const game = new Chess();

    for (let i = 0; i < movesArray.length; i++) {
      console.log(movesArray[i]);
      game.move(movesArray[i]);
    }
    setGame(game);

    const isPlayerWhite = await IsPlayerWhite(wagerAddress);
    setPlayerColor(isPlayerWhite);

    const isPlayerTurn = await GetPlayerTurn(wagerAddress);
    setPlayerTurn(isPlayerTurn);

    const gameNumberData: Array<Number> = await GetNumberOfGames(wagerAddress);
    const gameNumber = `${gameNumberData[0]} of ${gameNumberData[1]}`;
    setNumberOfGames(gameNumber);

    setLoading(false);
  }

  // Setting wager address in input box
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setWagerAddress(event.target.value);
  }

  // make move on board and verify with chess.js
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

    const moveString = sourceSquare + targetSquare;

    // submit move to smart contract
    handleSubmitMove(moveString);

    // illegal move
    if (move === null) return false;

    return true;
  };

  /*   const getPosition = async (wagerAddress: string) => {
    const moves = await GetGameMoves(wagerAddress);
    console.log(moves);
  };
 */
  return (
    <ChakraProvider>
      {loading ? (
        <Box
          width="500px"
          height="700px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Center
            position="absolute"
            top="40%"
            left="52%"
            transform="translate(-50%, -50%)"
            flexDirection="column" // added this line
          >
            <Spinner size="xl" />
            <Text mt={4}> Loading Game Data</Text>
          </Center>
        </Box>
      ) : (
        <Chessboard
          boardOrientation={isPlayerWhite ? 'white' : 'black'}
          onPieceDrop={onDrop}
          position={game.fen()}
        />
      )}

      <Box p={4}></Box>

      {wager === '' ? (
        <Flex direction="column" alignItems="center">
          <Input
            value={wagerAddress}
            onChange={handleChange}
            placeholder="input wager address"
          />
          <Box p={2}></Box>
          <Button colorScheme="green" onClick={handleSubmit}>
            View Game
          </Button>
        </Flex>
      ) : null}

      <Flex justify="space-between">
        <Text>Amount: 100 USDC</Text>
        <Text>Time Per Move: 2h</Text>
        <Text>Game: {numberOfGames}</Text>
        <Text>Your Turn: {isPlayerTurn ? 'True' : 'False'}</Text>
      </Flex>
    </ChakraProvider>
  );
};
