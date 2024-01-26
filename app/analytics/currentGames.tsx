'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Box, Flex, Skeleton, Text } from '@chakra-ui/react';

import { GetWagersFenDB, GetAnalyticsDB } from '#/lib/api/db-api';
import {
  GetAnalyticsData,
  GetGameMoves,
  GetNumberOfGames,
} from '#/lib/api/form';

import {
  useStateManager,
  checkMetaMaskConnection,
} from '#/lib/api/sharedState';

interface CurrentGamesProps {
  useAPI: boolean;
}

const CurrentGames: React.FC<CurrentGamesProps> = ({ useAPI }) => {
  const [wagerAddresses, setWagerAddresses] = useState<string[]>([]); // Specify string[] as the state type
  const [Games, setGames] = useState<string[]>([]);
  const [moveSquares, setMoveSquare] = useState({});
  const startingFen =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const [totalGames, setTotalGames] = useState('');
  const [totalWagers, setTotalWagers] = useState('');

  const [globalState, setGlobalState] = useStateManager();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setting true to always ping API (hotfix)
        // need to ping API and check if it is up
        if (true) {
          // trying to ping GCP chess fish api
          console.log('ChainID', globalState.chainID);
          const gameData = await GetWagersFenDB(globalState.chainID);

          const filteredGameData = gameData.filter(
            (item) => item.fenString !== startingFen,
          );

          const fenStrings = filteredGameData.map((item) => item.fenString);

          setGames(fenStrings);
        } else {
          // if useAPI is false, then use the Smart Contract via RPC link
          console.log('Getting all games via RPC-LINK');
          const [fetchedWagerAddresses, totalGames] = await GetAnalyticsData();

          setTotalGames(totalGames);
          setTotalWagers(fetchedWagerAddresses.length.toString());

          let GamesFen: string[] = [];
          for (let i = 0; i < fetchedWagerAddresses.length; i++) {
            const gameNumberData: Array<Number> = await GetNumberOfGames(
              fetchedWagerAddresses[i],
            );

            const movesArray = await GetGameMoves(
              fetchedWagerAddresses[i],
              Number(gameNumberData[0]),
            );
            const game = new Chess();

            for (let i = 0; i < movesArray.length; i++) {
              game.move(movesArray[i]);
            }
            GamesFen.push(game.fen());
          }
        }

        // setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [useAPI]);

  /* async function getLastMoveSourceSquare(game: Chess) {
    // Obtain all past moves
    const moves = game.history({ verbose: true });

    // If there are no moves, return false.
    if (moves.length === 0) {
      return false;
    }

    // Get the last move from the moves array
    const lastMove = moves[moves.length - 1];

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

    setMoveSquare(highlightSquares);

    return { from: fromSquare, to: toSquare };
} */

  const router = useRouter();
  const handleBoardClick = (address: string) => {
    router.push(`/game/${address}`);
  };

  return (
    <>
      <Text color="white" marginBottom="0.5">
        Latest Games
      </Text>
      <Flex wrap="wrap" justifyContent="center" w="100%">
        {Games.slice(0, 9).map((fen, index) => (
          <Flex
            key={index}
            m={15}
            marginTop={0}
            direction="column"
            align="center"
            w={{
              base: 'calc(100% - 30px)',
              sm: 'calc(50% - 30px)',
              md: 'calc(33.33% - 30px)',
            }}
            // On base (smallest screens), it takes the full width minus the margins.
            // On small (sm) screens, it takes half of the width minus the margins.
            // On medium (md) screens and above, it takes a third of the width minus the margins.
          >
            <Box
              as="button"
              onClick={() => handleBoardClick(wagerAddresses[index])}
              _hover={{ transform: 'scale(1.02)' }}
              transition="0.15s"
              w="100%"
            >
              <Chessboard
                arePiecesDraggable={false}
                position={fen}
                boardWidth={250}
                customSquareStyles={{
                  ...moveSquares,
                }}
              />
            </Box>
          </Flex>
        ))}
      </Flex>
    </>
  );
};

export default CurrentGames;
