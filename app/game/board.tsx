'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const { ethers } = require('ethers');

import { Card } from 'app/types';

const {
  CheckValidMove,
  GetGameMoves,
  PlayMove,
  IsPlayerWhite,
  GetPlayerTurn,
  GetNumberOfGames,
  GetWagerData,
  GetTimeRemaining,
  IsPlayerAddressWhite,
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
  const [timeLimit, setTimeLimit] = useState(0);
  const [wagerAmount, setWagerAmount] = useState('');

  const [timePlayer0, setTimePlayer0] = useState(0);
  const [timePlayer1, setTimePlayer1] = useState(0);
  const [isPlayer0Turn, setIsPlayer0Turn] = useState(false);
  const [isPlayer0White, setIsPlayer0White] = useState(false);

  const [matchData, setMatchData] = useState<Card>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const myAsyncFunction = async () => {
      if (wager != '') {
        console.log('HERERER');

        setWagerAddress(wager);

        const isPlayerTurn = await GetPlayerTurn(wager);
        setPlayerTurn(isPlayerTurn);

        // Your async function logic here
        const movesArray = await GetGameMoves(wager);
        const game = new Chess();

        for (let i = 0; i < movesArray.length; i++) {
          game.move(movesArray[i]);
        }
        setGame(game);

        const isPlayerWhite = await IsPlayerWhite(wager);
        setPlayerColor(isPlayerWhite);

        const gameNumberData: Array<Number> = await GetNumberOfGames(wager);
        const gameNumber = `${gameNumberData[0]} of ${gameNumberData[1]}`;
        setNumberOfGames(gameNumber);

        setLoading(false);

        const matchData = await GetWagerData(wager);
        setTimeLimit(matchData.timeLimit);

        // console.log(matchData.wagerAmount);

        setWagerAmount(
          ethers.utils.formatUnits(numberToString(matchData.wagerAmount), 18),
        );

        console.log('HERER');
        const [timePlayer0, timePlayer1, isPlayer0Turn] =
          await GetTimeRemaining(wager);

        console.log(timePlayer0);
        console.log(timePlayer1);
        console.log(isPlayer0Turn);

        setTimePlayer0(timePlayer0);
        setTimePlayer1(timePlayer1);

        setIsPlayer0Turn(isPlayer0Turn);

        const isPlayer0White = await IsPlayerAddressWhite(
          wager,
          matchData.player0Address,
        );

        console.log('IS PLAYER WHIT');
        console.log(isPlayer0White);
        setIsPlayer0White(isPlayer0White);
      } else {
        setLoading(false);
      }
    };
    myAsyncFunction();
  }, [wager]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlayer0Turn) {
      timer = setInterval(() => {
        setTimePlayer0((prevTime) => {
          // console.log('Player0');
          console.log(prevTime - 1); // Log the updated time here
          return prevTime - 1;
        });
      }, 1000);
    } else {
      timer = setInterval(() => {
        setTimePlayer1((prevTime) => {
          // console.log('Player 1');
          console.log(prevTime - 1); // Log the updated time here
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isPlayer0Turn, timePlayer0, timePlayer1]);

  function numberToString(num: number): string {
    return num.toLocaleString('fullwide', { useGrouping: false });
  }

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

  function formatSecondsToTime(secondsString: string): string {
    const seconds = parseInt(secondsString, 10);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${padZero(hours)} hours ${padZero(
      minutes,
    )} minutes ${padZero(remainingSeconds)} seconds`;
    return formattedTime;
  }

  function padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

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

      <div>
        {wager !== '' && (
          <div>
            <Flex justify="space-between">
              <Text>Amount: {wagerAmount} DAI</Text>
              <Text>
                Time Limit: {formatSecondsToTime(timeLimit.toString())}
              </Text>
              <Text>Game: {numberOfGames}</Text>
              <Text>Your Turn: {isPlayerTurn ? 'True' : 'False'}</Text>
            </Flex>

            {isPlayer0White ? (
              <>
                <Text>
                  Time Remaining White:{' '}
                  {formatSecondsToTime(timePlayer0.toString())}
                </Text>
                <Text>
                  Time Remaining Black:{' '}
                  {formatSecondsToTime(timePlayer1.toString())}
                </Text>
              </>
            ) : (
              <>
                <Text>
                  Time Remaining White:{' '}
                  {formatSecondsToTime(timePlayer1.toString())}
                </Text>
                <Text>
                  Time Remaining Black:{' '}
                  {formatSecondsToTime(timePlayer0.toString())}
                </Text>
              </>
            )}
          </div>
        )}
      </div>
    </ChakraProvider>
  );
};
