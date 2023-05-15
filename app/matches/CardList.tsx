'use client';

import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  Skeleton,
  Spinner,
  Flex,
} from '@chakra-ui/react';

const {
  GetAllWagers,
  AcceptWagerAndApprove,
  AcceptWagerConditions,
  GetPlayerTurn,
} = require('ui/wallet-ui/api/form');

import { useMetamask } from 'ui/wallet-ui/components/Metamask';

import CardAccordion from './CardAccordion'; // Import the CardAccordion component

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
}

interface Props {
  cards: Card[];
}

const CardList = () => {
  const [account, setAccount] = useState<string | null>(null);
  const { connect, accounts } = useMetamask();

  const [isLoading, setIsLoading] = useState(true);

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

  const [isLoadingApproval, setIsLoadingApproval] = useState(false);

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

  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    async function fetchCards() {
      try {
        setIsLoading(true);
        const data = await GetAllWagers();

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

  return (
    <ChakraProvider>
      <Box>
        <Heading as="h2" size="lg" mb={4}>
          Your Current Matches
        </Heading>
        {isLoading ? (
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        ) : cards.length ? (
          cards.map((card, index) => (
            <CardAccordion
              key={index}
              card={card}
              account={account}
              isLoadingApproval={isLoadingApproval}
              HandleClickApprove={HandleClickApprove}
              // ... any other props you need to pass
            />
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
