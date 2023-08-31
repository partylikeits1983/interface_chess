'use client';

import React, { useEffect, useState, FC } from 'react';

import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  Switch,
} from '@chakra-ui/react';

const { GetPendingTournaments } = require('ui/wallet-ui/api/form');
const { GetTournamentDataDB } = require('ui/wallet-ui/api/db-api');

import TournamentCard from './TournamentCard';
import CardFilterControls from './CardFilterControls';
import { useStateManager } from 'ui/wallet-ui/api/sharedState';

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
  isTournament: boolean;
}

interface Props {
  cards: TournamentData[];
}

interface TournamentListProps {
  useAPI: boolean;
}

const TournamentList: FC<TournamentListProps> = ({ useAPI }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<TournamentData[]>([]);

  const [sortValue, setSortValue] = useState('');
  const [filterValue, setFilterValue] = useState(false);

  const [globalState, setGlobalState] = useStateManager();

  useEffect(() => {
    async function fetchCards() {
      setIsLoading(true);

      if (globalState.useAPI) {
        const data = await GetTournamentDataDB(globalState.chainID);

        if (Array.isArray(data)) {
          setCards(data.reverse()); // reverse to show newest first
        } else {
          // console.error('GetAllWagers returned invalid data:', cards);
        }
      } else {
        try {
          const data = await GetPendingTournaments();

          if (Array.isArray(data)) {
            setCards(data.reverse()); // reverse to show newest first
          } else {
            // console.error('GetAllWagers returned invalid data:', cards);
          }
        } catch (error) {
          console.error('Error fetching wagers:', error);
        }
      }
      setIsLoading(false);
    }
    fetchCards();
  }, []);

  const sortedCards = [...cards].sort((a, b) => {
    switch (sortValue) {
      case 'isPending':
        return a.isInProgress === b.isInProgress ? 0 : a.isInProgress ? -1 : 1;
      case 'isTournament':
        return a.isTournament === b.isTournament ? 0 : a.isTournament ? -1 : 1;
      case 'wagerAmountAsc':
        return a.tokenAmount - b.tokenAmount;
      case 'wagerAmountDesc':
        return b.tokenAmount - a.tokenAmount;
      default:
        return 0;
    }
  });

  const filteredAndSortedCards = sortedCards.filter(
    (card) => !filterValue || card.isInProgress,
  );

  return (
    <ChakraProvider>
      <Box>
        <Flex alignItems="center" justifyContent="space-between" mb={4}>
          <Heading as="h2" size="lg">
            Join Tournament
          </Heading>
        </Flex>
        <CardFilterControls
          sortValue={sortValue}
          setSortValue={setSortValue}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
        />
        {isLoading ? (
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        ) : filteredAndSortedCards.length ? (
          filteredAndSortedCards.map((card, index) => (
            <TournamentCard key={index} card={card} />
          ))
        ) : (
          <Text fontSize="xl" color="gray.500">
            No tournaments in progress yet.
          </Text>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default TournamentList;
