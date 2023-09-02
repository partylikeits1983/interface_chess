'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Box, Flex, Skeleton } from '@chakra-ui/react';

import {
  GetWagersDB,
  GetWagersFenDB,
  GetAnalyticsDB,
} from 'ui/wallet-ui/api/db-api';
import {
  GetAnalyticsData,
  GetGameMoves,
  GetNumberOfGames,
} from 'ui/wallet-ui/api/form';

import { useStateManager } from 'ui/wallet-ui/api/sharedState';

interface CurrentGamesProps {
  useAPI: boolean;
}

const CurrentGames: React.FC<CurrentGamesProps> = ({ useAPI }) => {
  const [wagerAddresses, setWagerAddresses] = useState<string[]>([]); // Specify string[] as the state type
  const [Games, setGames] = useState<string[]>([]);

  const [totalGames, setTotalGames] = useState('');
  const [totalWagers, setTotalWagers] = useState('');

  const [globalState, setGlobalState] = useStateManager();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useAPI) {
          // trying to ping GCP chess fish api
          const addresses = await GetWagersDB(globalState.chainID);
          const fendata = await GetWagersFenDB(globalState.chainID);
          const [numberOfGames, numberOfWagers] = await GetAnalyticsDB(
            globalState.chainID,
          );

          setWagerAddresses(addresses);
          setGames(fendata);

          setTotalGames(numberOfGames);
          setTotalWagers(numberOfWagers);
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
          setGames(GamesFen.reverse()); // reverse to show newest first
          setWagerAddresses(fetchedWagerAddresses.reverse()); // same here
        }

        // setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [useAPI]);

  const router = useRouter();
  const handleBoardClick = (address: string) => {
    console.log(address);
    router.push(`/game/${address}`);
  };

  return (
    <Flex wrap="wrap" justifyContent="center" w="100%">
      {Games.slice(0, 9).map((fen, index) => (
        <Flex
          key={index}
          m={15}
          direction="column"
          align="center"
          w="calc(33.33% - 30px)" // considering the margin of 15 on both sides
        >
          <Box
            as="button"
            onClick={() => handleBoardClick(wagerAddresses[index])}
            _hover={{ transform: 'scale(1.02)' }}
            transition="0.15s"
            w="100%" // Ensure the Box fills its parent's width
          >
            <Chessboard
              arePiecesDraggable={false}
              position={fen}
              boardWidth={250}
            />
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};

export default CurrentGames;
