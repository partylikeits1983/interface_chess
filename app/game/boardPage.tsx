'use client';

const { ethers } = require('ethers');

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import GameInfo from './game-info';
import GameTimer from './game-timer';
import ScoreBoard from './score-board';
import ForwardBackButtons from './forward-back-buttons';
import opponentMoveNotification from 'ui/opponentMoveNotification';

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
  Spacer,
  Center,
  ChakraProvider,
  Tooltip,
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
  const [gameID, setGameID] = useState(0);

  const [game, setGame] = useState(new Chess());
  const [localGame, setLocalGame] = useState(new Chess());
  const [gameFEN, setGameFEN] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  );
  const [moves, setMoves] = useState<string[]>([]);
  const [moveNumber, setMoveNumber] = useState(0);

  const [wagerAddress, setWagerAddress] = useState('');
  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isPlayerTurnSC, setPlayerTurnSC] = useState(false);

  const [numberOfGames, setNumberOfGames] = useState(0);
  const [numberOfGamesInfo, setNumberOfGamesInfo] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);

  const [wagerToken, setWagerToken] = useState('');
  const [wagerAmount, setWagerAmount] = useState('');

  const [timePlayer0, setTimePlayer0] = useState(0);
  const [timePlayer1, setTimePlayer1] = useState(0);
  const [isPlayer0Turn, setIsPlayer0Turn] = useState(false);
  const [isPlayer0White, setIsPlayer0White] = useState(false);

  const [isLoading, setLoading] = useState(true);

  const router = useRouter();

  const handleBoardClick =
    (address: string) => async (e: React.MouseEvent<HTMLButtonElement>) => {
      // check if wager exists....
      const wager: Card = await GetWagerData(address);

      // check if wager is not empty and not null
      if (wager && Object.keys(wager).length !== 0) {
        alertWarningFeedback(`Getting wager data: ${wager.matchAddress}`);
        e.preventDefault(); // This may be optional, depending on your needs
        router.push(`/game/${address}`);
      } else {
        alertWarningFeedback('ROUTER: Wager address not found');
      }
    };

  // Setting wager address in input box
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setWagerAddress(event.target.value);
  }

  const handleBackGame = () => {
    setGameID((prevGameID) => {
      const newGameID = prevGameID > 0 ? prevGameID - 1 : prevGameID;
      const gameNumberInfo = `${newGameID + 1} of ${numberOfGames}`;
      setNumberOfGamesInfo(gameNumberInfo);
      return newGameID;
    });
  };

  const handleForwardGame = () => {
    // opponentMoveNotification('Your Turn to Move');
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

    if (moveNumber > 0) {
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

    // The 'from' property indicates the source square of the move
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

    setMoveSquares(highlightSquares);

    return { from: fromSquare, to: toSquare };
  }

  function numberToString(num: number): string {
    return num.toLocaleString('fullwide', { useGrouping: false });
  }

  // Initialize board
  useEffect(() => {
    const asyncSetWagerAddress = async () => {
      if (wager != '') {
        const gameNumberData: Array<Number> = await GetNumberOfGames(wager);
        const gameNumber = `${Number(gameNumberData[0]) + 1} of ${
          gameNumberData[1]
        }`;
        setGameID(Number(gameNumberData[0]));
        setNumberOfGames(Number(gameNumberData[1]));
        setNumberOfGamesInfo(gameNumber);
      }
    };
    asyncSetWagerAddress();
  }, [wager]);

  // Initialize board
  useEffect(() => {
    const asyncSetWagerAddress = async () => {
      if (wager != '') {
        setWagerAddress(wager);

        const _isPlayerTurn = await GetPlayerTurn(wager);
        setPlayerTurn(_isPlayerTurn);
        setPlayerTurnSC(_isPlayerTurn);

        const gameNumberData: Array<Number> = await GetNumberOfGames(wager);

        setGameID(Number(gameNumberData[0]));

        const movesArray = await GetGameMoves(wager, gameNumberData[0]);
        const newGame = new Chess();
        for (let i = 0; i < movesArray.length; i++) {
          newGame.move(movesArray[i]);
        }
        setGame(newGame);
        setGameFEN(newGame.fen());
        setLocalGame(newGame);

        const isPlayerWhite = await IsPlayerWhite(wager);
        setPlayerColor(isPlayerWhite);

        const matchData = await GetWagerData(wager);

        setWagerToken(matchData.wagerToken);

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

  // Initialize board
  useEffect(() => {
    const asyncSetWagerAddress = async () => {
      if (wager != '') {
        setWagerAddress(wager);

        const _isPlayerTurn = await GetPlayerTurn(wager);
        setPlayerTurn(_isPlayerTurn);
        setPlayerTurnSC(_isPlayerTurn);

        const movesArray = await GetGameMoves(wager, gameID);
        const newGame = new Chess();
        for (let i = 0; i < movesArray.length; i++) {
          newGame.move(movesArray[i]);
        }
        setGame(newGame);
        setMoveNumber(Number(movesArray.length) - 1);
        setGameFEN(newGame.fen());
        setLocalGame(newGame);
        getLastMoveSourceSquare(newGame, movesArray.length - 1);

        const isPlayerWhite = await IsPlayerWhite(wager);
        setPlayerColor(isPlayerWhite);

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
  }, [gameID]);

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

  async function handleSubmitMove(
    move: string,
    wasCaptured: boolean,
  ): Promise<boolean> {
    try {
      if (wasCaptured) {
        const moveSound = new Audio('/sounds/Capture.mp3');
        moveSound.load();
        moveSound.play();
      } else {
        const moveSound = new Audio('/sounds/Move.mp3');
        moveSound.load();
        moveSound.play();
      }

      let success = await PlayMove(wagerAddress, move);

      setPlayerTurnSC(false);

      return success;
    } catch (error) {
      console.log(error);
      return false;
    }
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
    handleSubmitMove(moveString, wasCaptured);

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

  const makeAMove = (move: any): [Move | null, boolean] => {
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

    return [result, wasCaptured]; // null if the move was illegal, the move object if the move was legal
  };

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

    const [move, wasCaptured] = makeAMove({
      from: moveFrom,
      to: square,
      promotion: 'q', // always promote to a queen for example simplicity
    });

    /*     
    const move = gameCopy.move({
      from: moveFrom,
      to: square,
      promotion: 'q', // always promote to a queen for example simplicity
    });
    setGame(gameCopy);
    setGameFEN(gameCopy.fen());
    setLocalGame(gameCopy); */

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

  // update time
  useEffect(() => {
    // define timer here
    let timer: NodeJS.Timeout;

    // determine whose turn it is and decrement the appropriate timer
    timer = setInterval(() => {
      if (isPlayer0Turn) {
        setTimePlayer0((prevTime) => prevTime - 1);
      } else {
        setTimePlayer1((prevTime) => prevTime - 1);
      }
    }, 1000);

    // return a cleanup function to clearInterval when isPlayer0Turn changes
    return () => {
      clearInterval(timer);
    };
  }, [isPlayer0Turn]); // Removed timePlayer0 and timePlayer1 from dependencies

  // MOVE LISTENER
  useEffect(() => {
    let isMounted = true;

    const updateState = (_isPlayerTurnSC: boolean, currentGame: Chess) => {
      if (isMounted) {
        const moveSound = new Audio('/sounds/Move.mp3');
        moveSound.load();
        moveSound.play();

        opponentMoveNotification('Your Turn to Move');

        setGame(currentGame);
        setMoveNumber(currentGame.moves().length);
        setGameFEN(currentGame.fen());
        setPlayerTurn(_isPlayerTurnSC);
        setPlayerTurnSC(_isPlayerTurnSC);

        getLastMoveSourceSquare(currentGame, currentGame.moves().length);

        // for timer func
        setIsPlayer0Turn(!isPlayer0Turn);
      }
    };

    const interval = setInterval(() => {
      (async () => {
        try {
          const _isPlayerTurnSC = await GetPlayerTurn(wagerAddress);

          const [timePlayer0, timePlayer1, isPlayer0Turn] =
            await GetTimeRemaining(wager);

          setIsPlayer0Turn(isPlayer0Turn);

          if (_isPlayerTurnSC !== isPlayerTurn) {
            const movesArray = await GetGameMoves(wager, gameID);
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
              setTimePlayer0(timePlayer0);
              setTimePlayer1(timePlayer1);
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
        <>
          <Box position="relative" mt={5}>
            {' '}
            {/* Adjust the number as needed */}
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
            <Box position="absolute" top="-12" right="0">
              {' '}
              {/* Change top to "0" again */}
              <ForwardBackButtons
                onBackMove={handleBackMove}
                onForwardMove={handleForwardMove}
                onBackGame={handleBackGame}
                onForwardGame={handleForwardGame}
              />
            </Box>
          </Box>
        </>
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
          <Tooltip
            label="Click to view the game"
            aria-label="View Game Tooltip"
          >
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
          </Tooltip>
        </Flex>
      ) : (
        <>
          {isLoading && wager !== '' ? (
            // Grey UI skeleton
            <>
              <Skeleton height="50px" startColor="gray.800" endColor="black" />
            </>
          ) : (
            <>
              {' '}
              <Box p={3} border="0.5px solid white">
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  alignItems="center"
                  justifyContent="center" // To center the items horizontally
                  width="100%" // To ensure the flex container takes the full width
                >
                  <Flex
                    alignItems="center" // This ensures that the GameTimer is vertically centered
                    justifyContent="center" // This ensures that the GameTimer is horizontally centered
                    mr={{ md: 4 }} // Optional margin to separate the GameTimer and ScoreBoard on larger screens
                  >
                    <GameTimer
                      wager={wager}
                      timeLimit={timeLimit}
                      timePlayer0={timePlayer0}
                      timePlayer1={timePlayer1}
                      isPlayerTurn={isPlayerTurn}
                      isPlayer0White={isPlayer0White}
                    />
                  </Flex>

                  <ScoreBoard wager={wager} numberOfGames={numberOfGamesInfo} />
                </Flex>
              </Box>
              <div style={{ marginTop: '10px' }}></div>
              <GameInfo
                wager={wager}
                wagerToken={wagerToken}
                wagerAmount={wagerAmount}
                numberOfGames={numberOfGamesInfo}
                timeLimit={timeLimit}
                timePlayer0={timePlayer0}
                timePlayer1={timePlayer1}
                isPlayerTurn={isPlayerTurn}
                isPlayer0White={isPlayer0White}
              />
            </>
          )}
        </>
      )}
    </ChakraProvider>
  );
};
