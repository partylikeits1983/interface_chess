'use client';

import { GetLeaderboardData } from 'ui/wallet-ui/api/form';
import { GetWagersDB } from 'ui/wallet-ui/api/db-api';

import {
  ChakraProvider,
  Stat,
  StatLabel,
  Box,
  StatNumber,
  StatGroup,
  Spinner,
  Table,
  Flex,
  Switch,
  Tooltip,
  Tr,
  Th,
  Td,
  Link,
} from '@chakra-ui/react';

import { QuestionOutlineIcon } from '@chakra-ui/icons';
import React, { useEffect, useState, FC } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

interface AnalyticsProps {
  useAPI: boolean;
  handleToggle: () => void;
}

const Leaderboard: FC<AnalyticsProps> = ({ useAPI, handleToggle }) => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!useAPI) {
        try {
          const playerStatistics = await GetLeaderboardData();
          const dataArray = Object.entries(playerStatistics).map(
            ([address, stats]) => ({
              playerAddress: address,
              ...stats,
            }),
          );
          console.log(dataArray);
          setLeaderboardData(dataArray);
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          // trying to ping the GCP API
          // const wagerAddresses = await GetWagersDB();
        } catch (error) {
          console.log(error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [useAPI]);

  // Sort data by games won
  const sortedData = [...leaderboardData].sort(
    (a, b) => b.gamesWon - a.gamesWon,
  );

  return (
    <ChakraProvider>
      <Flex justify="flex-end" pr={4} pt={0} alignItems="center">
        <Switch
          colorScheme="green"
          isChecked={!useAPI}
          onChange={handleToggle}
        />

        <Tooltip
          label="When switched on, gets values from on-chain (slower). Switch off if you don't have metamask"
          hasArrow
        >
          <QuestionOutlineIcon color="white" ml={2} />
        </Tooltip>
      </Flex>

      <Box overflowX="auto" maxWidth="100%">
        <Table variant="simple" mt={4} size="sm">
          <thead>
            <Tr>
              <Th color="white">#</Th>
              <Th color="white">Player Address</Th>
              <Th color="white">Games Played</Th>
              <Th color="white">Games Won</Th>
            </Tr>
          </thead>
          <tbody>
            {sortedData.map((playerData, index) => (
              <Tr key={index}>
                <Td color="white">
                  {index === 0
                    ? '🥇'
                    : index === 1
                    ? '🥈'
                    : index === 2
                    ? '🥉'
                    : index + 1}
                </Td>
                <Td color="white">{playerData.playerAddress}</Td>
                <Td color="white">{playerData.totalGames}</Td>
                <Td color="white">{playerData.gamesWon}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </ChakraProvider>
  );
};

export default Leaderboard;
