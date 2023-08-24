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

const { GetInProgressTournaments } = require('ui/wallet-ui/api/form');

// import { useMetamask } from 'ui/wallet-ui/components/Metamask';

import TournamentCard from './TournamentCard'; // Import the CardAccordion component
import CardFilterControls from './CardFilterControls';

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

const TournamentList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<TournamentData[]>([]);

  const [sortValue, setSortValue] = useState('');
  const [filterValue, setFilterValue] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      try {
        setIsLoading(true);
        const data = await GetInProgressTournaments();

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
          All Tournaments
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
