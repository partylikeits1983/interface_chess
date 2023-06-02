'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const { ethers } = require('ethers');

// import { Card } from 'app/types';
import { useRouter } from 'next/navigation';

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
  Skeleton,
  Center,
  ChakraProvider,
} from '@chakra-ui/react';

interface BoardProps {
  wager: string;
}

import GameInfo from './game-info';

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

  const [isLoading, setLoading] = useState(true);

  const [wager1, setWager] = useState('');

  useEffect(() => {
    const asyncSetWagerAddress = async () => {
      if (wager != '') {
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

        const matchData = await GetWagerData(wager);

        setWagerAmount(
          ethers.utils.formatUnits(numberToString(matchData.wagerAmount), 18),
        );

        const [timePlayer0, timePlayer1, isPlayer0Turn] =
          await GetTimeRemaining(wager);

        setTimeLimit(matchData.timeLimit);
        setTimePlayer0(timePlayer0);
        setTimePlayer1(timePlayer1);
        setIsPlayer0Turn(isPlayer0Turn);

        const isPlayer0White = await IsPlayerAddressWhite(
          wager,
          matchData.player0Address,
        );

        setIsPlayer0White(isPlayer0White);

        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    asyncSetWagerAddress();
  }, [wager]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlayer0Turn) {
      timer = setInterval(() => {
        setTimePlayer0((prevTime) => {
          return prevTime - 1;
        });
      }, 1000);
    } else {
      timer = setInterval(() => {
        setTimePlayer1((prevTime) => {
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isPlayer0Turn, timePlayer0, timePlayer1]);

  const router = useRouter();
  const handleBoardClick =
    (address: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); // This may be optional, depending on your needs
      console.log(address);
      router.push(`/game/${address}`);
    };

  function numberToString(num: number): string {
    return num.toLocaleString('fullwide', { useGrouping: false });
  }

  /// Chess Move logic

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

  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState('');

  const onSquareClick = (square: any): void => {
    // Make a move

    setRightClickedSquares({});

    function resetFirstMove(square: any) {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) setMoveFrom(square);
    }

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    console.log(square);
    /*     
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    // Move string
    const moveString: string = sourceSquare + targetSquare;

    console.log(moveString);
 */
    /*     // Reset moveFrom
    setMoveFrom(move ? '' : square);

    // Submit move to smart contract
    handleSubmitMove(moveString);

    // Set new move options
    if (!move) {
      getMoveOptions(square);
    } else {
      setOptionSquares({});
    } */
  };

  const [optionSquares, setOptionSquares] = useState({});

  function getMoveOptions(square: any) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      return false;
    }

    const newSquares: any = {};
    moves.map((move) => {
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
    return true;
  }

  return (
    <ChakraProvider>
      {isLoading ? (
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
          arePiecesDraggable={true}
          onSquareClick={onSquareClick}
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
          <Button
            color="black"
            backgroundColor="#94febf"
            onClick={handleBoardClick(wagerAddress)}
            _hover={{
              color: '#000000', // Set the text color on hover
              backgroundColor: '#62ffa2', // Set the background color on hover
            }}
          >
            View Game
          </Button>
        </Flex>
      ) : null}

      {isLoading ? (
        // Grey UI skeleton
        <>
          <Skeleton height="50px" startColor="gray.800" endColor="gray.700" />
        </>
      ) : (
        // GameInfo component
        <GameInfo
          wager={wager}
          wagerAmount={wagerAmount}
          numberOfGames={numberOfGames}
          timeLimit={timeLimit}
          timePlayer0={timePlayer0}
          timePlayer1={timePlayer1}
          isPlayerTurn={isPlayerTurn}
          isPlayer0White={isPlayer0White}
        />
      )}
    </ChakraProvider>
  );
};
