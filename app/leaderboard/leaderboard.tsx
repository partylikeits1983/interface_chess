'use client';

import { GetLeaderboardData } from '#/lib/api/form';
import { GetLeaderboardDataDB } from '#/lib/api/db-api';

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
  Text,
} from '@chakra-ui/react';

import { QuestionOutlineIcon } from '@chakra-ui/icons';
import React, { useEffect, useState, FC } from 'react';

import { useStateManager } from '#/lib/api/sharedState';

interface AnalyticsProps {
  useAPI: boolean;
  handleToggle: () => void;
}

const Leaderboard: FC<AnalyticsProps> = ({ useAPI, handleToggle }) => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [sortedData, setSortedData] = useState<any[]>([]);
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
          setLeaderboardData(dataArray);
          const sortedArray = [...dataArray].sort(
            (a, b) => b.gamesWon - a.gamesWon,
          );
          setSortedData(sortedArray);
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const chainId = globalState.chainID;
          const playerStatistics = await GetLeaderboardDataDB(chainId);
          if (Array.isArray(playerStatistics)) {
            setLeaderboardData(playerStatistics);
            const sortedArray = [...playerStatistics].sort(
              (a, b) => b.gamesWon - a.gamesWon,
            );
            setSortedData(sortedArray);
          }
        } catch (error) {
          alertWarningFeedback('ChessFish API returned 404, use metamask');
          console.log(error);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [useAPI, globalState]);

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
        ) : sortedData.length === 0 ? (
          <Text color="white" mt={4}>
            No players on chain yet
          </Text>
        ) : (
          <Table variant="simple" mt={4} size="sm">
            <thead>
              <Tr>
                <Th color="white">#</Th>
                <Th color="white">Player Address</Th>
                <Th color="white">Games Won</Th>
                <Th color="white">Total Games</Th>
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
                  <Td color="white">{playerData.gamesWon}</Td>
                  <Td color="white">{playerData.totalGames}</Td>
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
