'use client';
const { ethers } = require('ethers');
const {
  GetAllWagers,
  Approve,
  AcceptWagerConditions,
} = require('ui/wallet-ui/api/form');

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  ChakraProvider,
} from '@chakra-ui/react';

interface Card {
  matchAddress: string;
  opponentAddress: string;
  wagerToken: string;
  wagerAmount: number;
  timePerMove: number;
  numberOfGames: number;
  isPending: boolean;
}

interface Props {
  cards: Card[];
}
const CardList = () => {
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);

  const HandleClickApprove = async (
    wagerAddress: string,
    wagerToken: string,
    wagerAmount: number,
  ) => {
    setIsLoadingApproval(true);
    await Approve(wagerToken, wagerAmount);
    await AcceptWagerConditions(wagerAddress);
    await setIsLoadingApproval(false);
  };

  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    async function fetchCards() {
      try {
        const data = await GetAllWagers();

        if (Array.isArray(data)) {
          setCards(data);
        } else {
          console.error('GetAllWagers returned invalid data:', cards);
        }
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
          Challenges List
        </Heading>
        {cards.length ? (
          <Stack spacing={8}>
            {cards.map((card, index) => (
              <Box
                key={index}
                bg="black"
                border="1px solid white"
                borderRadius="md"
                p={1}
                color="white"
              >
                <Heading as="h3" size="md" mb={1}>
                  Match: {card.matchAddress}
                </Heading>
                <Text fontSize="sm">Oppenent: {card.opponentAddress}</Text>
                <Text fontSize="sm">Wager Token: {card.wagerToken}</Text>
                <Text fontSize="sm">Wager Amount: {card.wagerAmount}</Text>
                <Text fontSize="sm">Time Per Move: {card.timePerMove}</Text>
                <Text fontSize="sm">Number of Games: {card.numberOfGames}</Text>
                <Text fontSize="sm">
                  Status: {card.isPending ? 'Wager In Progress' : 'Pending'}
                </Text>
                {!card.isPending && (
                  <Button
                    colorScheme="green"
                    mt={4}
                    isLoading={isLoadingApproval}
                    loadingText="Submitting Approval Transaction"
                    onClick={() =>
                      HandleClickApprove(
                        card.matchAddress,
                        card.wagerToken,
                        card.wagerAmount,
                      )
                    }
                  >
                    Accept Wager
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Text fontSize="xl">No matches created yet.</Text>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default CardList;
