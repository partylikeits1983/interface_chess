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

const { GetPendingTournaments } = require('../../lib/api/form');
const { GetTournamentDataDB } = require('lib/api/db-api');
import { TournamentData } from '../../lib/api/form';

import TournamentCard from './TournamentCard';
import CardFilterControls from './CardFilterControls';
import { useStateManager } from '#/lib/api/sharedState';

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

      console.log('globstat', globalState.useAPI);

      if (globalState.useAPI) {
        const data = await GetTournamentDataDB(globalState.chainID);

        if (Array.isArray(data)) {
          setCards(data.reverse()); // reverse to show newest first
        } else {
          setCards([])
          // console.error('GetAllWagers returned invalid data:', cards);
        }
      } else {
        try {
          const tournaments = await GetPendingTournaments();

          if (Array.isArray(tournaments)) {
            setCards(tournaments.reverse()); // reverse to show newest first
          } else {
            setCards([])
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
            There are no open tournaments. Create a tournament!
          </Text>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default TournamentList;
