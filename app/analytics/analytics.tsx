'use client';

import {
  Box,
  Spinner,
  OrderedList,
  ListItem,
  StatLabel,
  StatArrow,
  StatNumber,
  StatHelpText,
  StatGroup,
  Stat,
  ChakraProvider,
} from '@chakra-ui/react';

import { GetNumberOfOpenWagers } from 'ui/wallet-ui/api/form';

import { useState, useEffect } from 'react';

export default function Analytics() {
  const [totalGames, setTotalGames] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call your async function here to get the total number of games
        const totalGamesData = await GetNumberOfOpenWagers();

        console.log(totalGamesData.length);

        setTotalGames(totalGamesData.length.toString());

        // setTotalGames(totalGamesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching total games:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ChakraProvider>
      <StatGroup color="white">
        <Stat>
          <StatLabel>Total Number of Games Played</StatLabel>
          {loading ? <Spinner /> : <StatNumber>{totalGames}</StatNumber>}
        </Stat>

        <Stat>
          <StatLabel>Current Number of Wagers</StatLabel>
          {loading ? <Spinner /> : <StatNumber>{totalGames}</StatNumber>}
        </Stat>
      </StatGroup>
    </ChakraProvider>
  );
}
