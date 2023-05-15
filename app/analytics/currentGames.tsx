'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Input,
  Box,
  Button,
  Flex,
  Text,
  Spinner,
  Center,
  ChakraProvider,
  VStack,
} from '@chakra-ui/react';

import { GetAnalyticsData, GetGameMoves } from 'ui/wallet-ui/api/form';

const CurrentGames = () => {
  const [totalGames, setTotalGames] = useState('');
  const [totalWagers, setTotalWagers] = useState('');
  const [wagerAddresses, setWagerAddresses] = useState<string[]>([]); // Specify string[] as the state type

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const [Games, setGames] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Getting all games');
        // Call your async function here to get the total number of games
        const [fetchedWagerAddresses, totalGames] = await GetAnalyticsData();

        setWagerAddresses(fetchedWagerAddresses);
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
        setGames(GamesFen);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching total games:', error);
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
      {Games.map((fen, index) => (
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
