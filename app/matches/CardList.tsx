'use client';

import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  Select,
  Switch,
} from '@chakra-ui/react';

const { GetAllWagers } = require('../api/form');

import { useMetamask } from 'ui/wallet-ui/components/Metamask';

import CardAccordion from './CardAccordion'; // Import the CardAccordion component
import CardFilterControls from './CardFilterControls';

interface Card {
  matchAddress: string;
  player0Address: string;
  player1Address: string;
  wagerToken: string;
  wagerAmount: number;
  numberOfGames: number;
  isInProgress: boolean;
  timeLimit: number;
  timeLastMove: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayerTurn: boolean;
  isTournament: boolean;
  isComplete: boolean;
}

interface Props {
  cards: Card[];
}

const CardList = () => {
  const [account, setAccount] = useState<string | null>(null);
  const { connect, accounts } = useMetamask();

  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);

  const [sortValue, setSortValue] = useState('');
  const [filterValue, setFilterValue] = useState(false);

  const [showOnlyTournaments, setShowOnlyTournaments] = useState(false); // add this state

  useEffect(() => {
    const handleConnect = async () => {
      if (account === undefined) {
        const isConnected = await connect();
        if (!isConnected) {
          setAccount('');
        }
      }
    };

    handleConnect();
  }, [account, connect]);

  useEffect(() => {
    setAccount(accounts[0]);
  }, [accounts]);

  useEffect(() => {
    async function fetchCards() {
      try {
        setIsLoading(true);
        const data = await GetAllWagers();

        console.log(data);

        if (Array.isArray(data)) {
          setCards(data.reverse()); // reverse to show newest first
        } else {
          console.error('GetAllWagers returned invalid data:', cards);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching wagers:', error);
      }
    }
    fetchCards();
  }, []);

  const sortedCards = [...cards].sort((a, b) => {
    console.log(sortValue);
    switch (sortValue) {
      case 'isPending':
        return a.isInProgress === b.isInProgress ? 0 : a.isInProgress ? -1 : 1;
      case 'isTournament':
        return a.isTournament === b.isTournament ? 0 : a.isTournament ? -1 : 1;
      case 'wagerAmountAsc':
        return a.wagerAmount - b.wagerAmount;
      case 'wagerAmountDesc':
        return b.wagerAmount - a.wagerAmount;
      default:
        return 0;
    }
  });

  const filteredAndSortedCards = sortedCards.filter(
    (card) =>
      (!filterValue || card.isInProgress) &&
      (!showOnlyTournaments || card.isTournament),
  );

  return (
    <ChakraProvider>
      <Box>
        <Heading as="h2" size="lg" mb={4}>
          Your Current Matches
        </Heading>

        <Flex
          align="center"
          justifyContent="space-between"
          paddingBottom="20px"
        >
          <Flex width="50%">
            <Select
              size="sm"
              style={{ color: 'white' }}
              value={sortValue}
              onChange={(event) => setSortValue(event.target.value)}
              placeholder=""
              bg="black"
              color="white"
              width="100%"
            >
              <option style={{ color: 'black' }} value="isPending">
                In Progress First
              </option>
              <option style={{ color: 'black' }} value="wagerAmountAsc">
                Wager Amount (lowest first)
              </option>
              <option style={{ color: 'black' }} value="wagerAmountDesc">
                Wager Amount (highest first)
              </option>
            </Select>
          </Flex>
          <Flex width="50%" justifyContent="flex-end">
            <label htmlFor="hide-pending-games" style={{ marginRight: '10px' }}>
              Hide Pending
            </label>
            <Switch
              id="hide-pending-games"
              isChecked={filterValue}
              onChange={(event) => setFilterValue(event.target.checked)}
            />
          </Flex>

          <Flex width="50%" justifyContent="flex-end">
            <label htmlFor="show-tournaments" style={{ marginRight: '10px' }}>
              Show only Tournaments
            </label>
            <Switch
              id="show-tournaments"
              isChecked={showOnlyTournaments}
              onChange={(event) => setShowOnlyTournaments(event.target.checked)}
            />
          </Flex>
        </Flex>

        {isLoading ? (
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        ) : filteredAndSortedCards.length ? (
          filteredAndSortedCards.map((card, index) => (
            <CardAccordion key={index} card={card} account={account} />
          ))
        ) : (
          <Text fontSize="xl" color="gray.500">
            You haven&apos;t created any matches yet.
          </Text>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default CardList;
