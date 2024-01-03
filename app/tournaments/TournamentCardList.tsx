'use client';

import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
} from '@chakra-ui/react';

const { GetInProgressTournaments } = require('../../lib/api/form');
const { GetTournamentDataDB } = require('lib/api/db-api');

import TournamentCard from './TournamentCard'; // Import the CardAccordion component
import CardFilterControls from './CardFilterControls';

import { useStateManager } from '#/lib/api/sharedState';

import { TournamentData } from '#/lib/api/form';

interface Props {
  cards: TournamentData[];
}

const TournamentList = () => {
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
        console.log(data);
        if (Array.isArray(data)) {
          setCards(data.reverse()); // reverse to show newest first
        } else {
          // console.error('GetAllWagers returned invalid data:', cards);
        }
      } else {
        try {
          const data = await GetInProgressTournaments();

          console.log("data", data);

          if (Array.isArray(data)) {
            setCards(data.reverse()); // reverse to show newest first
          } else {
            // console.error('GetAllWagers returned invalid data:', cards);
          }
          setIsLoading(false);
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
        <Heading as="h2" size="lg" mb={4}>
          In Progress Tournaments
        </Heading>
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
