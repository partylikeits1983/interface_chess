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

import { GetWagersDB, GetWagersFenDB } from 'ui/wallet-ui/api/db-api';
// import { GetAnalyticsData, GetGameMoves } from 'ui/wallet-ui/api/form';

const CurrentGames = () => {
  const [wagerAddresses, setWagerAddresses] = useState<string[]>([]); // Specify string[] as the state type
  const [Games, setGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // const [game, setGame] = useState(new Chess());
  // const [moves, setMoves] = useState<string[]>([]);
  // const [totalGames, setTotalGames] = useState('');
  // const [totalWagers, setTotalWagers] = useState('');

  // ping RPC LINK DIRECTLY NO DB
  /* 
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Getting all games');
         
        // Call your async function here to get the total number of games
        // const [fetchedWagerAddresses, totalGames] = await GetAnalyticsData();

        // setTotalGames(totalGames);
        // setTotalWagers(fetchedWagerAddresses.length.toString());

        
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
        
        const GamesFen = await GetWagersDB("https://chess-fish-game-db.vercel.app/getgames");

        setGames(GamesFen.reverse)
        // console.log(GamesFen)
        // setGames(GamesFen);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching total games:', error);
      }
    };

    fetchData();
  }, []);
 */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addresses = await GetWagersDB(
          'https://chess-fish-game-db.vercel.app/wageraddresses',
        );

        const fendata = await GetWagersFenDB(
          'https://chess-fish-game-db.vercel.app/getwagersfen',
        );

        setWagerAddresses(addresses.reverse());

        setGames(fendata.reverse());
        setLoading(false);
      } catch (error) {
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
