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

const {
  GetAllWagersForPairing,
  AcceptWagerAndApprove,
  AcceptWagerConditions,
  GetAllWagersForPairing_NOMETAMASK,
} = require('../../lib/api/form');

import { useMetamask } from 'ui/wallet-ui/components/Metamask';

import {
  useStateManager,
  checkMetaMaskConnection,
} from '#/lib/api/sharedState';

import CardAccordion from './CardAccordion'; // Import the CardAccordion component
import CardFilterControls from './CardFilterControls';

import { Card } from '../../app/types';

interface Props {
  cards: Card[];
}

const CardList = () => {
  const [globalState, setGlobalState] = useStateManager();

  const [account, setAccount] = useState<string | null>(null);
  const { connect, accounts } = useMetamask();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);

  const [sortValue, setSortValue] = useState('');
  const [filterValue, setFilterValue] = useState(false);

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

  const HandleClickApprove = async (
    wagerAddress: string,
    wagerToken: string,
    wagerAmount: number,
  ) => {
    setIsLoadingApproval(true);
    console.log(wagerToken);

    // await Approve(wagerToken, wagerAmount);
    await AcceptWagerAndApprove(wagerAddress);
    await AcceptWagerConditions(wagerAddress);

    setIsLoadingApproval(false);
  };

  useEffect(() => {
    async function fetchCards() {
      try {
        setIsLoading(true);

        // console.log("API", globalState.useAPI);
        const hasMetamask = await checkMetaMaskConnection();
        if (hasMetamask) {
          console.log('PINGING ');
          const data = await GetAllWagersForPairing();

          if (Array.isArray(data)) {
            setCards(data.reverse()); // reverse to show newest first
          } else {
            console.error('GetAllWagers returned invalid data:', cards);
          }
          setIsLoading(false);
        } else {
          const data = await GetAllWagersForPairing_NOMETAMASK();

          if (Array.isArray(data)) {
            setCards(data.reverse()); // reverse to show newest first
          } else {
            console.error('GetAllWagers returned invalid data:', cards);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching wagers:', error);
      }
    }
    fetchCards();
  }, []);

  const sortedCards = [...cards].sort((a, b) => {
    switch (sortValue) {
      case 'isPending':
        // If filterValue is true, then we don't want to show cards with wagerAmount of 0
        if (filterValue && (a.wagerAmount === 0 || b.wagerAmount === 0)) {
          return a.wagerAmount === b.wagerAmount ? 0 : a.wagerAmount ? -1 : 1;
        } else {
          return a.wagerAmount === b.wagerAmount ? 0 : a.wagerAmount ? 1 : -1;
        }
      case 'wagerAmountAsc':
        return a.wagerAmount - b.wagerAmount;
      case 'wagerAmountDesc':
        return b.wagerAmount - a.wagerAmount;
      case 'gamesAmountAsc':
        return a.numberOfGames - b.numberOfGames;
      case 'gamesAmountDesc':
        return b.numberOfGames - a.numberOfGames;
      default:
        return 0;
    }
  });

  const filteredAndSortedCards = sortedCards.filter(
    (card) => !filterValue || card.wagerAmount !== Number(0),
  );

  return (
    <ChakraProvider>
      <Box>
        <Heading as="h2" size="lg" mb={4}>
          Pairing Room
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
            <CardAccordion
              key={index}
              card={card}
              account={account}
              // ... any other props you need to pass
            />
          ))
        ) : (
          <Text fontSize="xl" color="gray.500">
            No matches in pairing pool.
          </Text>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default CardList;
