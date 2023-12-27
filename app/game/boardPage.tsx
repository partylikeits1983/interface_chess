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
import {
  checkIfGasless,
  submitMoves,
  DownloadMoves,
} from '../../lib/api/gaslessAPI';

import BackAndForwardGameControls from './boardUtils/gameControls';
import { moveExists, numberToString } from './boardUtils/chessUtils'; // Utility functions

import useCheckValidMove from './boardUtils/useCheckValidMove';
import useUpdateTime from './boardUtils/useUpdateTime';

import { IBoardProps, IGameSocketData } from './interfaces/interfaces';

import { useDisclosure } from '@chakra-ui/react';
import SubmitMovesModal from './submitMovesModal';
import SignatureModal from './signatureModal';

import DownloadMovesButton from './boardUtils/downloadMoves';

const {
  CheckValidMove,
  GetGameMoves,
  PlayMove,
  GetPlayerTurn,
  GetPlayerTurnSC,
  GetNumberOfGames,
  GetWagerData,
  GetTimeRemaining,
  IsPlayerAddressWhite,
  GetConnectedAccount,
  GetGameNumber,
  GetIsWagerComplete,
  IsPlayer0White,
  setupProvider,
  IsPlayerWhite,
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
import { useStateManager } from '#/lib/api/sharedState';
import { match } from 'assert';

export const Board: React.FC<IBoardProps> = ({ wager }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
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

  const [isPlayerWhite, setPlayerColorWhite] = useState(true);
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
  const [isWagerComplete, setIsWagercomplete] = useState(false);

  const [isLoading, setLoading] = useState(true);
  const [isGameInfoLoading, setIsGameInfoLoading] = useState(true);

  const [arePiecesDraggable, setArePiecesDraggable] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [wereMovesSubmitted, setWereMovesSubmitted] = useState(false);
  // const [doesDele]

  useCheckValidMove(moves, CheckValidMove);
  useUpdateTime(isWagerComplete, isPlayer0Turn, setTimePlayer0, setTimePlayer1);

  const {
    optionSquares,
    rightClickedSquares,
    moveSquares,
    setMoveSquares,
    onSquareClick,
    handleBoardClick,
    wagerAddress,
    setWagerAddress,
    handleChange,
    onDrop,
    getLastMoveSourceSquare,
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
    wager,
    game,
    setMoveSquares,
    setMoves,
    setGame,
    setGameID,
    setNumberOfGamesInfo,
    setMoveNumber,
    setGameFEN,
    getLastMoveSourceSquare,
  });

  useEffect(() => {
    setWagerAddress(wager);

    // Function to fetch game status
    const fetchGameStatus = async () => {
      try {
        const isGameGasless: boolean = await checkIfGasless(wager);
        setIsGameGasless(isGameGasless);

        let { isWalletConnected } = await setupProvider();
        setIsWalletConnected(isWalletConnected);

        if (!isWalletConnected) {
          setPlayerColorWhite(true);
        } else {
          updateGameInfo(wager);
        }
      } catch (err) {
        console.log(err);
      }
      setHasPingedAPI(true);
    };
    fetchGameStatus();
  }, []);

  async function updateGameInfo(wager: string): Promise<void> {
    let isPlayerWhite = await IsPlayerWhite(wager);
    setPlayerColorWhite(isPlayerWhite);

    let isPlayer0White = await IsPlayer0White(wager);
    setIsPlayer0White(isPlayer0White);

    const gameNumberData: Array<number> = await GetNumberOfGames(wager);
    const gameNumber = `${Number(gameNumberData[0]) + 1} of ${
      gameNumberData[1]
    }`;
    setGameID(Number(gameNumberData[0]));
    setNumberOfGames(Number(gameNumberData[1]));
    setNumberOfGamesInfo(gameNumber);

    const isWagerComplete = await GetIsWagerComplete(wagerAddress);
    setIsWagercomplete(isWagerComplete);
  }

  // Initialize board
  useEffect(() => {
    // Function to set wager address and game information
    const asyncSetWagerAddress = async () => {
      // if (!isGameGasless) {
      if (wager !== '') {
        try {
          // setLoading(true);
          if (isWalletConnected) {
            await updateGameInfo(wager);
            setIsGameInfoLoading(false);
          }
          // setLoading(false);
        } catch (err) {
          console.log(err);
        }
        // }
      }
    };
    // Call both functions
    asyncSetWagerAddress();
  }, [wager, isWalletConnected]);

  useEffect(() => {
    const initializeBoard = async () => {
      if (isWalletConnected) {
        if (wager === '' || hasPingedAPI === false) {
          return;
        }

        setWagerAddress(wager);
        const matchData = await GetWagerData(wager);
        setWagerAmount(
          ethers.utils.formatUnits(numberToString(matchData.wagerAmount), 18),
        );
        setWagerToken(matchData.wagerToken);
        setTimeLimit(matchData.timeLimit);

        let movesArray = [];
        let newGame = new Chess();

        let gameNumber = await GetGameNumber(wager);
        setGameID(gameNumber);
        if (gameNumber !== undefined) {
          movesArray = await GetGameMoves(wager, gameNumber);
          movesArray.forEach((move: any) => newGame.move(move));
        }

        if (isGameGasless === false && movesArray.length === 0) {
          const [timePlayer0, timePlayer1, isPlayer0Turn] =
            await GetTimeRemaining(wager);
          setTimePlayer0(timePlayer0);
          setTimePlayer1(timePlayer1);

          setIsPlayer0Turn(isPlayer0Turn);
        }

        if (isGameGasless === false) {
          const isPlayer0White = await IsPlayerAddressWhite(
            wager,
            matchData.player0Address,
          );
          setIsPlayer0White(isPlayer0White);

          const isPlayerTurn = await GetPlayerTurn(wager);

          console.log('263', isPlayerTurn);
          setArePiecesDraggable(isPlayerTurn);

          // const isPlayer0Turn = await setMoves(movesArray);
          updateState('222', true, newGame);
        }
        setLoading(false);
      }
      setLoading(false);
    };

    initializeBoard();
  }, [hasPingedAPI]);

  // handles reseting the board after SubmitMovesModal
  useEffect(() => {
    const updateAfterMoveSubmit = async () => {
      if (isWalletConnected) {
        if (wager !== '' || hasPingedAPI === true) {
          let newGame = new Chess();
          setGameFEN(newGame.fen());
          setGame(newGame);

          let newGameID = gameID + 1;
          setGameID(newGameID);

          const isPlayerTurn = await GetPlayerTurnSC(wager);

          setPlayerTurn(isPlayerTurn);

          const [timePlayer0, timePlayer1, isPlayer0Turn] =
            await GetTimeRemaining(wager);
          setTimePlayer0(timePlayer0);
          setTimePlayer1(timePlayer1);

          setIsPlayer0Turn(isPlayer0Turn);

          setArePiecesDraggable(isPlayerTurn);

          updateGameInfo(wager);

          console.log('309');
          setMoveNumber(0);

          // board info
          setIsPlayer0White(!isPlayer0White);

          setMoveSquares({});
        }
      }
    };
    updateAfterMoveSubmit();
  }, [wereMovesSubmitted]);

  function isCheckmate(wager: string) {
    setMoveSquares({});

    if (isWalletConnected) {
      updateGameInfo(wager);
    }

    let newGameID = gameID + 1;
    setGameID(newGameID);
  }

  const handleUpdateUI = async (gameSocketData: IGameSocketData) => {
    // Destructuring data from gameSocketData
    const {
      wagerToken,
      wagerAmount,
      isTournament,
      numberOfGames,
      moves,
      gameFEN,
      player0,
      player1,
      playerTurn,
      timeLimit,
      timeRemainingPlayer0,
      timeRemainingPlayer1,
      timeLastUpdated,
      actualTimeRemainingSC,
    } = gameSocketData;

    // Initialize game state
    let currentGame = new Chess();
    const gameNumber = moves.length - 1;
    let lastMove = null;

    // Process moves for the current game
    for (let i = 0; i < moves[gameNumber].length; i++) {
      lastMove = currentGame.move(moves[gameNumber][i]);
    }

    let isNewGame = false;

    // Check for checkmate
    if (currentGame.isCheckmate()) {
      isCheckmate(wager);

      // Chain integration logic
      let gameNumberOnChain;
      if (isWalletConnected === true) {
        let gameNumberData = await GetNumberOfGames(wager);
        gameNumberOnChain = Number(gameNumberData[0]);
      } else {
        gameNumberOnChain = gameNumber - 1;
      }

      let isSubmittedOnChain = gameNumberOnChain > gameNumber;

      // if not submitted on chain
      if (!isSubmittedOnChain) {
        // Play checkmate sound
        const checkmateSound = new Audio('/sounds/GenericNotify.mp3');
        checkmateSound.load();
        checkmateSound.play();

        // Wallet connected actions
        if (isWalletConnected === true) {
          onOpen();
        }
        setMoveNumber(0);
      } else {
        isNewGame = true;
        currentGame = new Chess();
        setMoveNumber(0);
      }
    } else {
      // Handle piece capture or regular move sound
      if (lastMove && lastMove.captured) {
        // Play capture sound
        const captureSound = new Audio('/sounds/Capture.mp3');
        captureSound.load();
        captureSound.play();
      } else {
        // Play move sound
        const moveSound = new Audio('/sounds/Move.mp3');
        moveSound.load();
        moveSound.play();
      }
    }
    // Wallet connected state updates
    if (isWalletConnected) {
      const isPlayerTurn = await GetPlayerTurn(wager);
      setArePiecesDraggable(isPlayerTurn);
      setPlayerTurn(isPlayerTurn);

      console.log("PLAYER TURN", isPlayerTurn);
    }

    // Handling new game state
    if (isNewGame) {
      const isPlayer0White = await IsPlayerAddressWhite(wager, player0);
      setIsPlayer0White(isPlayer0White);

      const actualTimeRemaining0 =
        timeRemainingPlayer0 -
        (Math.floor(Date.now() / 1000) - timeLastUpdated);
      const actualTimeRemaining1 =
        timeRemainingPlayer1 -
        (Math.floor(Date.now() / 1000) - timeLastUpdated);

      setTimePlayer0(actualTimeRemaining0);
      setTimePlayer1(actualTimeRemaining1);

      setMoveNumber(0);

      updateGameInfo(wager);
    } else {
      // Regular game updates
      console.log(player0, playerTurn);

      let isPlayer0Turn = player0 === playerTurn ? true : false;

      const actualTimeRemaining0 =
        timeRemainingPlayer0 -
        (Math.floor(Date.now() / 1000) - timeLastUpdated);
      const actualTimeRemaining1 =
        timeRemainingPlayer1 -
        (Math.floor(Date.now() / 1000) - timeLastUpdated);

      setTimePlayer0(actualTimeRemaining0);
      setTimePlayer1(actualTimeRemaining1);

      setIsPlayer0Turn(isPlayer0Turn);

      setGameID(moves.length);

      updateState('333', isPlayer0Turn, currentGame);

      // Offline wallet handling
      if (isWalletConnected === false) {
        setArePiecesDraggable(false);
        setPlayerColorWhite(true);

        // @dev set decimals to decimal amount in erc20
        setWagerAmount(
          ethers.utils.formatUnits(numberToString(wagerAmount), 18),
        );
        setWagerToken(wagerToken);
        setTimeLimit(timeLimit);

        // Normally handled by updateGameInfo
        setNumberOfGames(numberOfGames);
        const gameNumber = `${Number(moves.length) + 1} of ${numberOfGames}`;
        setNumberOfGamesInfo(gameNumber);
      }
    }

    // Finalize UI update
    setLoading(false);
  };

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
        console.log('Connected to websocket');
        socket.emit('getGameFen', wager.toLowerCase());
        socket.emit('subscribeToGame', wager.toLowerCase());
      });

      socket.on('updateGameFen', async (data) => {
        // alert("RECIEVE DATA")
        console.log('Received game data:', data);
        if (isMounted) {
          const gameSocketData: IGameSocketData = data;
          await handleUpdateUI(gameSocketData);
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
  }, [wager, isGameGasless, isWalletConnected]);

  // MOVE LISTENER useEffect - Polling
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    // Polling occurs when isGameGasless is strictly false
    if (isGameGasless === false && isWalletConnected) {
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
                  updateState('381', _isPlayerTurnSC, currentGame);

                  // this may not be needed...
                  const isPlayerTurn = await GetPlayerTurn(wager);

                  setArePiecesDraggable(isPlayerTurn);
                }
                setTimePlayer0(timePlayer0);
                setTimePlayer1(timePlayer1);
              }
            }
            setLoading(false);
          } catch (error) {
            console.error(error);
          }
        })();
      }, 5000);
    }
    setLoading(false);
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

  const updateState = (
    source: string,
    _isPlayerTurnSC: boolean,
    currentGame: Chess,
  ) => {
    console.log('updateState', source, currentGame.isCheckmate());

    if (currentGame.isCheckmate()) {
      setMoveNumber(0);
    }

    if (currentGame.history().length !== 0) {
      setGame(currentGame);

      setMoveNumber(currentGame.history().length);

      setMoves(currentGame.history());

      getLastMoveSourceSquare(currentGame, currentGame.history().length - 1);

      setGameFEN(currentGame.fen());

      setPlayerTurn(_isPlayerTurnSC);
      setPlayerTurnSC(_isPlayerTurnSC);
    } else {
      setMoveNumber(0);
    }
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

      // let moveNumber = moves.length;

      if (isMoveGasLess) {
        setIsGameGasless(true);
      }

      console.log('MOVE NUMBER', moveNumber);

      let success = await PlayMove(
        isMoveGasLess,
        true, // is delegated
        moveNumber,
        wagerAddress,
        move,
      );

      setPlayerTurnSC(false);
      setPlayerTurn(false);
      setIsPlayer0Turn(!isPlayer0Turn);

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
            flexDirection="column"
          >
            <Spinner size="xl" />
            <Text mt={4}> Loading Game Data</Text>
          </Center>
        </Box>
      ) : (
        <>
          <Box position="relative" mt={5}>
            {' '}
            <Chessboard
              boardOrientation={isPlayerWhite ? 'white' : 'black'}
              arePiecesDraggable={arePiecesDraggable}
              onSquareClick={(square) =>
                onSquareClick(square, arePiecesDraggable)
              }
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
                justifyContent="space-between" // This spreads out the children
                mb={3}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text mr={2}>Turn off to submit move on chain</Text>
                  <Switch
                    isChecked={isMoveGasLess}
                    onChange={() => setIsMoveGasLess(!isMoveGasLess)}
                  />
                </div>

                {wager && <DownloadMovesButton wager={wager} />}
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
                      isPlayer0White={isPlayer0White}
                      isPlayer0Turn={isPlayer0Turn}
                    />
                  </Flex>

                  <ScoreBoard
                    wager={wager}
                    numberOfGames={numberOfGamesInfo}
                    isPlayer0White={isPlayer0White}
                    gameNumber={gameID}
                  />
                </Flex>
              </Box>
              <div style={{ marginTop: '10px' }}></div>
              {!isGameInfoLoading && (
                <GameInfo
                  wager={wager}
                  wagerToken={wagerToken}
                  wagerAmount={wagerAmount}
                  numberOfGames={numberOfGamesInfo}
                  timeLimit={timeLimit}
                />
              )}
            </>
          )}
        </>
      )}
      <SubmitMovesModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmitMoves={submitMoves}
        gameWager={wager}
        gameID={gameID}
        wereMovesSubmitted={wereMovesSubmitted}
        setWereMovesSubmitted={setWereMovesSubmitted}
      />

      <SignatureModal
        isOpen={true}
        onClose={onClose}
        onSubmitMoves={submitMoves}
        gameWager={wager}
      />
    </ChakraProvider>
  );
};
