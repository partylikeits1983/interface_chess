'use client';

import { GetLeaderboardData } from 'ui/wallet-ui/api/form';
import { GetLeaderboardDataDB } from 'ui/wallet-ui/api/db-api';

import alertWarningFeedback from '#/ui/alertWarningFeedback';

import {
  ChakraProvider,
  Box,
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

import { useStateManager } from 'ui/wallet-ui/api/sharedState';

interface AnalyticsProps {
  useAPI: boolean;
  handleToggle: () => void;
}

const Leaderboard: FC<AnalyticsProps> = ({ useAPI, handleToggle }) => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [globalState, setGlobalState] = useStateManager();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (useAPI) {
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
          const chainId = globalState.chainID;
          const playerStatistics = await GetLeaderboardDataDB(chainId);

          console.log(playerStatistics);
          setLeaderboardData(playerStatistics);
        } catch (error) {
          alertWarningFeedback('ChessFish API returned 404, use metamask');
          console.log(error);
        }
      }
      setIsLoading(false);
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
          label="When switched on, gets values ChessFish API (faster). Switch off if you want to use your metamask RPC url."
          hasArrow
        >
          <QuestionOutlineIcon color="white" ml={2} />
        </Tooltip>
      </Flex>

      <Box overflowX="auto" maxWidth="100%">
        {isLoading ? (
          <>
            <Spinner />
          </>
        ) : (
          <Table variant="simple" mt={4} size="sm">
            <thead>
              <Tr>
                <Th color="white">#</Th>
                <Th color="white">Player Address</Th>
                <Th color="white">Total Games</Th>
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
        )}
      </Box>
    </ChakraProvider>
  );
};

export default Leaderboard;
