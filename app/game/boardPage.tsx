'use client';

import io from 'socket.io-client';

// do not use import...
const ethers = require('ethers');

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import GameInfo from './game-info';
import GameTimer from './game-timer';
import ScoreBoard from './score-board';
import ForwardBackButtons from './forward-back-buttons';
import opponentMoveNotification from 'ui/opponentMoveNotification';
import { checkIfGasless } from '../../lib/api/gaslessAPI';

import BackAndForwardGameControls from './boardUtils/gameControls';
import { moveExists, numberToString } from './boardUtils/chessUtils'; // Utility functions

import { useRouter } from 'next/navigation';

import useCheckValidMove from './boardUtils/useCheckValidMove';
import useUpdateTime from './boardUtils/useUpdateTime';

import {
  IBoardProps,
  IGameSocketData,
} from './interfaces/interfaces';

const {
  CheckValidMove,
  GetGameMoves,
  PlayMove,
  GetPlayerTurn,
  GetNumberOfGames,
  GetWagerData,
  GetTimeRemaining,
  IsPlayerAddressWhite,
} = require('../../lib/api/form');

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
  Tooltip,
  Switch,
} from '@chakra-ui/react';

import { BoardUtils } from './boardUtils/boardUtils';

export const Board: React.FC<IBoardProps> = ({ wager }) => {

  const [hasPingedAPI, setHasPingedAPI] = useState(false);

  const [isMoveGasLess, setIsMoveGasLess] = useState(true);

  const [gameID, setGameID] = useState(0);

  const [game, setGame] = useState(new Chess());
  const [localGame, setLocalGame] = useState(new Chess());
  const [gameFEN, setGameFEN] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  );
  const [moves, setMoves] = useState<string[]>([]);
  const [moveNumber, setMoveNumber] = useState(0);

  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isPlayerTurnSC, setPlayerTurnSC] = useState(false);

  const [numberOfGames, setNumberOfGames] = useState(0);
  const [numberOfGamesInfo, setNumberOfGamesInfo] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);

  const [wagerToken, setWagerToken] = useState('');
  const [wagerAmount, setWagerAmount] = useState('');

  const [timePlayer0, setTimePlayer0] = useState<number>(0);
  const [timePlayer1, setTimePlayer1] = useState<number>(0);
  
  const [isPlayer0Turn, setIsPlayer0Turn] = useState(false);
  const [isPlayer0White, setIsPlayer0White] = useState(false);

  const [isGameGasless, setIsGameGasless] = useState(false);

  const [isLoading, setLoading] = useState(true);

  useCheckValidMove(moves, CheckValidMove);
  useUpdateTime(isPlayer0Turn, setTimePlayer0, setTimePlayer1);

  const {
    optionSquares,
    //setOptionSquares,
    // potentialMoves,
    // setPotentialMoves,
    rightClickedSquares,
    // setRightClickedSquares,
    // moveFrom,
    // setMoveFrom,
    moveSquares,
    // setMoveSquares,
    // makeAMove,
    onSquareClick,
    // getMoveOptions,
    handleBoardClick,
    wagerAddress,
    setWagerAddress,
    handleChange,
    onDrop,
    getLastMoveSourceSquare
  } = BoardUtils(
    game,
    setGame,
    moves,
    setMoves,
    setGameFEN,
    setLocalGame,
    setMoveNumber,
    setPlayerTurn,
    handleSubmitMove,
  );

  const {
    handleBackGame,
    handleForwardGame,
    handleBackMove,
    handleForwardMove,
  } = BackAndForwardGameControls({
    hasGameInitialized: true, // Replace with actual condition
    moveNumber,
    numberOfGames,
    game,
    setGameID,
    setNumberOfGamesInfo,
    setMoveNumber,
    setGameFEN,
    getLastMoveSourceSquare,
  });

  useEffect(() => {
    // initialize
    setWagerAddress(wager);

    // Function to fetch game status
    const fetchGameStatus = async () => {
      try {
        const result: boolean = await checkIfGasless(wager);
        setIsGameGasless(result);
      } catch (err) {
        console.log(err);
      }
      setHasPingedAPI(true);
    };
    fetchGameStatus();

  }, [wager]);

  // Initialize board
  useEffect(() => {
    // Function to set wager address and game information
    const asyncSetWagerAddress = async () => {
      if (!isGameGasless) {
      if (wager !== '') {
        try {
          const gameNumberData: Array<Number> = await GetNumberOfGames(wager);
          const gameNumber = `${Number(gameNumberData[0]) + 1} of ${
            gameNumberData[1]
          }`;
          setGameID(Number(gameNumberData[0]));
          setNumberOfGames(Number(gameNumberData[1]));
          setNumberOfGamesInfo(gameNumber);
        } catch (err) {
          console.log(err);
        }
      }
    };
  }
    // Call both functions
    asyncSetWagerAddress();
  }, [wager, isGameGasless]);


  // Initialize board
  useEffect(() => {
    let isMounted = true;

    const asyncSetWagerAddress = async () => {
      if (wager !== '' && hasPingedAPI === true) {
        setWagerAddress(wager);

        if (isGameGasless === false) {
          const matchData = await GetWagerData(wager);
          setWagerAmount(
            ethers.utils.formatUnits(numberToString(matchData.wagerAmount), 18),
          );
          setTimeLimit(matchData.timeLimit);

          const [timePlayer0, timePlayer1, isPlayer0Turn] =
            await GetTimeRemaining(wager);
          setTimePlayer0(timePlayer0);
          setTimePlayer1(timePlayer1);
          setIsPlayer0Turn(isPlayer0Turn);

          const isPlayer0White = await IsPlayerAddressWhite(
            wager,
            matchData.player0Address,
          );
          setIsPlayer0White(isPlayer0White);

          if (gameID !== undefined) {
            const movesArray = await GetGameMoves(wager, gameID);
            const newGame = new Chess();
            movesArray.forEach((move: any) => {
              newGame.move(move);
            });

            updateState("222", true, newGame);
          }
        } else {
          // Establish WebSocket connection for gasless game
/*           const socket = io('https://api.chess.fish', {
            transports: ['websocket'],
            path: '/socket.io/',
          });

          socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            socket.emit('subscribeToGame', wager);
          });

          socket.on('gameUpdate', (data) => {
            if (isMounted) {
              const { moves } = data;

              alert("INIT")


              const currentGame = new Chess();
              moves.forEach((move: string) => {
                currentGame.move(move);
              });

              updateState("248", true, currentGame);
            }
          });

          socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
          });

          // Clean up the socket connection when the component is unmounted
          return () => {
            socket.disconnect();
          }; */
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    asyncSetWagerAddress();

    // Clean up for the useEffect hook itself
    return () => {
      isMounted = false;
    };
  }, [wager, gameID, isGameGasless]);

  // MOVE LISTENER - WebSocket
  useEffect(() => {
    let isMounted = true;

    // WebSocket connection is established when isGameGasless is true
    if (isGameGasless === true) {
      const socket = io('https://api.chess.fish', {
        transports: ['websocket'],
        path: '/socket.io/',
      });

      socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('getGameFen', wager);
        socket.emit('subscribeToGame', wager);
      });

      socket.on('updateGameFen', (data) => {
        console.log('Received game data:', data);
        if (isMounted) {
          const {
            moves,
            gameFEN,
            player0,
            player1,
            playerTurn,
            timeRemainingPlayer0,
            timeRemainingPlayer1,
            actualTimeRemainingSC,
          } = data;

          const currentGame = new Chess();
          moves.forEach((move: string) => currentGame.move(move));

          const isPlayer0Turn = playerTurn === player0 ? true : false;

          setTimePlayer0(timeRemainingPlayer0);
          setTimePlayer1(timeRemainingPlayer1);
          setIsPlayer0Turn(isPlayer0Turn);
          updateState("333", true, currentGame);
          getLastMoveSourceSquare(currentGame, moves.length - 1);
          
        }
      });

      socket.on('error', (errMsg) => {
        console.error('Error:', errMsg);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }

    return () => {
      isMounted = false;
    };
  }, [wager, isGameGasless]);

  // MOVE LISTENER useEffect - Polling
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    // Polling occurs when isGameGasless is strictly false
    if (isGameGasless === false) {
      interval = setInterval(() => {
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

              if (
                localGame.fen() === currentGame.fen() ||
                _isPlayerTurnSC !== isPlayerTurnSC
              ) {
                if (isMounted) { 
                  updateState("381", _isPlayerTurnSC, currentGame);
                }
                setTimePlayer0(timePlayer0);
                setTimePlayer1(timePlayer1);
              }
            }
          } catch (error) {
            console.error(error);
          }
        })();
      }, 2000);
    }
    return () => {
      clearInterval(interval); // Clear the interval when the component unmounts
      isMounted = false;
    };
  }, [
    wager,
    wagerAddress,
    localGame,
    isPlayerTurn,
    isPlayerTurnSC,
    isGameGasless,
  ]);

  const updateState = (source: string, _isPlayerTurnSC: boolean, currentGame: Chess) => {
    const moveSound = new Audio('/sounds/Move.mp3');
    moveSound.load();
    moveSound.play();

    opponentMoveNotification('Your Turn to Move');
    // alert(source);

    setGame(currentGame);
    setMoveNumber(currentGame.moves().length);
    setGameFEN(currentGame.fen());
    setPlayerTurn(_isPlayerTurnSC);
    setPlayerTurnSC(_isPlayerTurnSC);

    getLastMoveSourceSquare(currentGame, currentGame.moves().length - 1);
    setIsPlayer0Turn(!isPlayer0Turn);

    setLoading(false);
};

  // HANDLE SUBMIT MOVE - depends on isGasLess
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

      let success = await PlayMove(isMoveGasLess, gameFEN, wagerAddress, move);

      setPlayerTurnSC(false);

      return success;
    } catch (error) {
      console.log(error);
      return false;
    }
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
              <Box
                p={3}
                border="0.5px solid white"
                display="flex"
                alignItems="center"
                mb={3}
              >
                {' '}
                {/* added mb={3} here */}
                <Text mr={2}>Turn off to submit move on chain</Text>
                <Switch
                  isChecked={isMoveGasLess}
                  onChange={() => setIsMoveGasLess(!isMoveGasLess)}
                />{' '}
              </Box>
              <div style={{ marginTop: '10px' }}></div>
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
