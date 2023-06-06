'use client';

const { ethers } = require('ethers');

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import GameInfo from './game-info';

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
import alertWarningFeedback from '#/ui/alertWarningFeedback';

interface Card {
  matchAddress: string;
  player0Address: string;
  player1Address: string;
  wagerToken: string;
  wagerAmount: number;
  numberOfGames: number;
  isInProgress: boolean;
  timeLimit: number;
  timeLastMove: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayerTurn: boolean;
}

interface BoardProps {
  wager: string;
}

export const Board: React.FC<BoardProps> = ({ wager }) => {
  const [game, setGame] = useState(new Chess());
  const [localGame, setLocalGame] = useState(new Chess());
  const [gameFEN, setGameFEN] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  );
  const [moves, setMoves] = useState<string[]>([]);

  const [wagerAddress, setWagerAddress] = useState('');
  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isPlayerTurnSC, setPlayerTurnSC] = useState(false);
  // const [isPlayerTurnSC_NEW, setPlayerTurnSC_NEW] = useState(false);

  const [numberOfGames, setNumberOfGames] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);
  const [wagerAmount, setWagerAmount] = useState('');

  const [timePlayer0, setTimePlayer0] = useState(0);
  const [timePlayer1, setTimePlayer1] = useState(0);
  const [isPlayer0Turn, setIsPlayer0Turn] = useState(false);
  const [isPlayer0White, setIsPlayer0White] = useState(false);

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const asyncSetWagerAddress = async () => {
      console.log('Initialize');
      if (wager != '') {
        setWagerAddress(wager);

        const _isPlayerTurn = await GetPlayerTurn(wager);
        setPlayerTurn(_isPlayerTurn);
        setPlayerTurnSC(_isPlayerTurn);

        const movesArray = await GetGameMoves(wager);
        const game = new Chess();
        for (let i = 0; i < movesArray.length; i++) {
          game.move(movesArray[i]);
        }
        setGame(game);
        setGameFEN(game.fen());
        setLocalGame(game);

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
  /* 
  useEffect(() => {
    (async () => {
      const _isPlayerTurn: boolean = await GetPlayerTurn(wager);
      setPlayerTurn(_isPlayerTurn);
    })();
  
    // If isPlayerTurn has a dependency on something else,
    // add it to the dependency array below
  }, []); // Empty array means this runs once on mount
  
  useEffect(() => {
    console.log("IsPlayerTurn");
    console.log(isPlayerTurn);
  }, [isPlayerTurn]); // This runs every time isPlayerTurn changes

 */
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
    (address: string) => async (e: React.MouseEvent<HTMLButtonElement>) => {
      // check if wager exists....
      const wager: Card = await GetWagerData(address);

      // check if wager is not empty and not null
      if (wager && Object.keys(wager).length !== 0) {
        alert(wager.matchAddress);
        e.preventDefault(); // This may be optional, depending on your needs
        console.log(address);
        router.push(`/game/${address}`);
      } else {
        alertWarningFeedback('Wager address not found');
      }
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

  async function handleSubmitMove(move: any): Promise<boolean> {
    try {
      const moveSound = new Audio('/sounds/Move.mp3');
      moveSound.load();
      moveSound.play();

      let success = await PlayMove(wagerAddress, move);

      setPlayerTurnSC(false);

      return success;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // Setting wager address in input box
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setWagerAddress(event.target.value);
  }

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
      setGameFEN(gameCopy.fen());
      setLocalGame(gameCopy);

      console.log('HERE IN MAKE A MOVE');
    } catch {
      result = null;
      console.log('invalid move');
    }

    console.log(gameCopy.ascii());

    return result; // null if the move was illegal, the move object if the move was legal
  };

  const onDrop = (sourceSquare: any, targetSquare: any) => {
    setRightClickedSquares({});
    setMoveFrom('');
    setOptionSquares({});
    setPotentialMoves([]);

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });

    const moveString = sourceSquare + targetSquare;

    // submit move to smart contract
    handleSubmitMove(moveString);

    setPlayerTurn(false);

    // illegal move
    if (move === null) return false;

    return true;
  };

  // CLICK TO MOVE
  const [optionSquares, setOptionSquares] = useState({});
  const [potentialMoves, setPotentialMoves] = useState<Move[]>([]);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState('');
  const [moveSquares, setMoveSquares] = useState({});

  interface Move {
    color: string;
    piece: string;
    from: string;
    to: string;
    san: string;
    flags: string;
    lan: string;
    before: string;
    after: string;
  }

  function moveExists(
    potentialMoves: Move[],
    from: string,
    to: string,
  ): boolean {
    return (
      potentialMoves.find((move) => move.from === from && move.to === to) !==
      undefined
    );
  }

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
      console.log(potentialMoves);

      return;
    }

    // attempt to make move
    const gameMoves = game.fen();
    const gameCopy = new Chess();
    gameCopy.load(gameMoves);

    const move = gameCopy.move({
      from: moveFrom,
      to: square,
      promotion: 'q', // always promote to a queen for example simplicity
    });
    setGame(gameCopy);
    setGameFEN(gameCopy.fen());
    setLocalGame(gameCopy);

    // if invalid, setMoveFrom and getMoveOptions
    if (move === null) {
      resetFirstMove(square);
      return;
    }

    // calling smart contract to send tx
    const moveString = moveFrom + square;
    handleSubmitMove(moveString);

    setPlayerTurn(false);
    setMoveFrom('');
    setOptionSquares({});
    setPotentialMoves([]);
  };

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
    setPotentialMoves(moves);

    return true;
  }

  useEffect(() => {
    let isMounted = true;

    const updateState = (_isPlayerTurnSC: boolean, currentGame: Chess) => {
      if (isMounted) {
        const moveSound = new Audio('/sounds/Move.mp3');
        moveSound.load();
        moveSound.play();

        setGame(currentGame);
        setGameFEN(currentGame.fen());
        setPlayerTurn(_isPlayerTurnSC);
        setPlayerTurnSC(_isPlayerTurnSC);
      }
    };

    const interval = setInterval(() => {
      (async () => {
        try {
          const _isPlayerTurnSC = await GetPlayerTurn(wagerAddress);

          if (_isPlayerTurnSC !== isPlayerTurn) {
            const movesArray = await GetGameMoves(wager);
            const currentGame = new Chess();

            for (let i = 0; i < movesArray.length; i++) {
              currentGame.move(movesArray[i]);
            }

            // Only update game state if the moves on-chain match with local state
            if (
              localGame.fen() === currentGame.fen() ||
              _isPlayerTurnSC !== isPlayerTurnSC
            ) {
              updateState(_isPlayerTurnSC, currentGame);
            }
          }
        } catch (error) {
          console.error(error);
        }
      })();
    }, 2000);

    return () => {
      clearInterval(interval);
      isMounted = false;
    };
  }, [wager, wagerAddress, localGame, isPlayerTurn, isPlayerTurnSC]); // Add moveSound to dependencies array

  /* 
  // Un-optimized working code that I wrote... above is the chatgpt edited code
  // NEEDS WORK
  useEffect(() => {
    const interval = setInterval(async () => {
      const _isPlayerTurnSC = await GetPlayerTurn(wagerAddress);

      console.log('MOVE LISTENER');

      if (_isPlayerTurnSC !== isPlayerTurn) {
        const movesArray = await GetGameMoves(wager);
        const currentGame = new Chess();
        for (let i = 0; i < movesArray.length; i++) {
          currentGame.move(movesArray[i]);
        }
        // Only update game state if the moves on-chain match with local state
        if (localGame.fen() === currentGame.fen()) {
          console.log('localGame.fen() === currentGame.fen()');
          setGame(currentGame);
          setGameFEN(currentGame.fen());
          setPlayerTurn(_isPlayerTurnSC);
          setPlayerTurnSC(_isPlayerTurnSC);
        }

        if (_isPlayerTurnSC !== isPlayerTurnSC) {
          console.log('_isPlayerTurnSC !== isPlayerTurnSC');
          setGame(currentGame);
          setGameFEN(currentGame.fen());
          setPlayerTurn(_isPlayerTurnSC);
          setPlayerTurnSC(_isPlayerTurnSC);
        }
      }
    }, 5000); // 6 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, [wager, wagerAddress, localGame, isPlayerTurn, isPlayerTurnSC]);
 */
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
          animationDuration={70}
          onPieceDrop={onDrop}
          position={gameFEN}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
            ...rightClickedSquares,
          }}
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

      {isLoading && wager !== '' ? (
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
