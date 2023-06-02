'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Box, Flex, Skeleton } from '@chakra-ui/react';

import { GetWagersDB, GetWagersFenDB } from 'ui/wallet-ui/api/db-api';
import { GetAnalyticsData, GetGameMoves } from 'ui/wallet-ui/api/form';

const CurrentGames = () => {
  const [wagerAddresses, setWagerAddresses] = useState<string[]>([]); // Specify string[] as the state type
  const [Games, setGames] = useState<string[]>([]);

  //const [isLoading, setLoading] = useState(true);
  // const [game, setGame] = useState(new Chess());
  // const [moves, setMoves] = useState<string[]>([]);

  const [totalGames, setTotalGames] = useState('');
  const [totalWagers, setTotalWagers] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // trying to ping GCP chess fish api
        const addresses = await GetWagersDB();
        const fendata = await GetWagersFenDB();

        setWagerAddresses(addresses.reverse());
        setGames(fendata.reverse());

        // setLoading(false);
      } catch (error) {
        try {
          // if the GCP api is down => then try to use RPC link
          console.log('Getting all games via RPC-LINK');
          const [fetchedWagerAddresses, totalGames] = await GetAnalyticsData();

          setTotalGames(totalGames);
          setTotalWagers(fetchedWagerAddresses.length.toString());

          let GamesFen: string[] = [];
          for (let i = 0; i < fetchedWagerAddresses.length; i++) {
            const movesArray = await GetGameMoves(fetchedWagerAddresses[i]);
            const game = new Chess();

            for (let i = 0; i < movesArray.length; i++) {
              game.move(movesArray[i]);
            }
            GamesFen.push(game.fen());
          }
          setGames(GamesFen.reverse()); // reverse to show newest first
          setWagerAddresses(fetchedWagerAddresses.reverse()); // same here

          // setLoading(false);
        } catch {
          console.error(error);
        }

        console.error(error);
      }
    };
    fetchData();
  }, []);

  const router = useRouter();
  const handleBoardClick = (address: string) => {
    console.log(address);
    router.push(`/game/${address}`);
  };

  return (
    <Flex wrap="wrap" justifyContent="center">
      {Games.slice(0, 9).map((fen, index) => (
        <Flex key={index} m={15} direction="column" align="center">
          <Box
            as="button"
            onClick={() => handleBoardClick(wagerAddresses[index])}
            _hover={{ transform: 'scale(1.02)' }}
            transition="0.15s"
          >
            <Chessboard
              arePiecesDraggable={false}
              position={fen}
              boardWidth={250} // 100% to fill the box
            />
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};

export default CurrentGames;
