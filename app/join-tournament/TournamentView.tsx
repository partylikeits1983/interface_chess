'use client';

const { ethers } = require('ethers');

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Text, Spinner, Center, ChakraProvider } from '@chakra-ui/react';

import { useStateManager } from '#/app/api/sharedState';
import alertWarningFeedback from '#/ui/alertWarningFeedback';

import TournamentList from './TournamentCardList';
import TournamentCard from './TournamentCard';

import { getChainId, GetTournament } from '#/app/api/form';

interface TournamentData {
  tournamentNonce: number;
  numberOfPlayers: number;
  players: string[];
  numberOfGames: number;
  token: string;
  tokenAmount: number;
  isInProgress: boolean;
  startTime: number;
  timeLimit: number;
  isComplete: boolean;
}

interface CardAccordionProps {
  card: TournamentData;
}

interface TournamentViewProps {
  tournamentID: string;
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  tournamentID,
}) => {
  const [isLoading, setIsLoading] = useState(true); // 1. Initialize isLoading to true
  const [isIdDefined, setIdIsDefined] = useState(!!tournamentID); // Default based on the truthiness of tournamentID
  const [Tournament, setTournament] = useState<TournamentData>();

  const [useAPI, setUseAPI] = useState(true);

  const [globalState, setGlobalState] = useStateManager();

  useEffect(() => {
    async function fetchTournament() {
      console.log('globstat', globalState.useAPI);

      if (tournamentID) {
        // 3. Check for truthiness
        try {
          const data = await GetTournament(parseInt(tournamentID));
          if (data !== null) {
            setTournament(data);
            setIdIsDefined(true);
          } else {
            // error
          }
        } catch (error) {
          console.error('Error fetching tournament:', error);
        }
      } else {
        setIdIsDefined(false);
      }

      setIsLoading(false); // 2. Set isLoading to false after fetching data or handling the error
    }
    fetchTournament();
  }, [tournamentID]); // Added dependency to useEffect, to react to tournamentID changes

  return (
    <ChakraProvider>
      {isLoading ? (
        <Box
          width="1000px"
          height="300px"
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
            <Text mt={4}> Loading Tournament Data</Text>
          </Center>
        </Box>
      ) : (
        <>
          {isIdDefined ? (
            <>{Tournament ? <TournamentCard card={Tournament} /> : null}</>
          ) : (
            <>
              <TournamentList useAPI={globalState.useAPI}></TournamentList>
            </>
          )}
        </>
      )}
    </ChakraProvider>
  );
};
