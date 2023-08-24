'use client';

const { ethers } = require('ethers');

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Input,
  Box,
  Button,
  Flex,
  Text,
  Spinner,
  Skeleton,
  Spacer,
  Center,
  ChakraProvider,
  Tooltip,
} from '@chakra-ui/react';
import alertWarningFeedback from '#/ui/alertWarningFeedback';

import TournamentList from './TournamentCardList';

interface TournamentViewProps {
  tournamentID: string;
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  tournamentID,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [isIdDefined, setIDisDefined] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (tournamentID !== '') {
      setIDisDefined(true);
    }
  }, []);

  return (
    <ChakraProvider>
      {isLoading ? (
        <Box
          width="500px"
          height="700px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Center
            position="absolute"
            top="40%"
            left="52%"
            transform="translate(-50%, -50%)"
            flexDirection="column" // added this line
          >
            <Spinner size="xl" />
            <Text mt={4}> Loading Tournament Data</Text>
          </Center>
        </Box>
      ) : (
        <>
          {isIdDefined ? (
            <>
              <Text>TRUE</Text>
              <Text>{tournamentID}</Text>
            </>
          ) : (
            <>
              <Text>FALSE</Text>
              <TournamentList></TournamentList>
            </>
          )}
        </>
      )}
    </ChakraProvider>
  );
};
