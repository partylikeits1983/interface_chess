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
  player0Address: string;
  player1Address: string;
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
          <Stack spacing={4}>
            {cards.map((card, index) => (
              <Box
                key={index}
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                p={2}
              >
                <Stack spacing={2}>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Match Address
                    </Text>
                    <Text fontSize="md">{card.matchAddress}</Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Opponent Address
                    </Text>
                    <Text fontSize="md">
                      {card.isPending
                        ? card.player1Address
                        : card.player0Address}
                    </Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Wager Token
                    </Text>
                    <Text fontSize="md">{card.wagerToken}</Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Wager Amount
                    </Text>
                    <Text fontSize="md">{card.wagerAmount}</Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Time Per Move
                    </Text>
                    <Text fontSize="md">{card.timePerMove}</Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Number of Games
                    </Text>
                    <Text fontSize="md">{card.numberOfGames}</Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Status
                    </Text>
                    <Text fontSize="md">
                      {card.isPending ? 'Wager In Progress' : 'Pending'}
                    </Text>
                  </Stack>
                  {!card.isPending && (
                    <Button
                      colorScheme="green"
                      size="sm"
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
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Text fontSize="xl" color="gray.500">
            No matches created yet.
          </Text>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default CardList;
