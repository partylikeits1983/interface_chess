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
  useClipboard,
  Flex,
  ChakraProvider,
} from '@chakra-ui/react';

import { CopyIcon } from '@chakra-ui/icons';

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

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  function formatAddress(address: string): string {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid Ethereum address');
    }

    return `${address.substr(0, 6)}...${address.substr(-8)}`;
  }

  async function handleCopyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      console.log('Address copied to clipboard:', address);
      // You can add a toast or other visual feedback to let the user know the address was copied.
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }

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
                    <Flex alignItems="center">
                      <Text fontSize="md">
                        {formatAddress(card.matchAddress)}
                      </Text>
                      <CopyIcon
                        ml={2}
                        cursor="pointer"
                        onClick={() => handleCopyAddress(card.matchAddress)}
                      />
                    </Flex>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Opponent Address
                    </Text>
                    <Flex alignItems="center">
                      <Text fontSize="md">
                        {card.isPending
                          ? formatAddress(card.player1Address)
                          : formatAddress(card.player0Address)}
                      </Text>
                      <CopyIcon
                        ml={2}
                        cursor="pointer"
                        onClick={() =>
                          handleCopyAddress(
                            card.isPending
                              ? card.player1Address
                              : card.player0Address,
                          )
                        }
                      />
                    </Flex>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Wager Token
                    </Text>
                    <Flex alignItems="center">
                      <Text fontSize="md">
                        {formatAddress(card.wagerToken)}
                      </Text>
                      <CopyIcon
                        ml={2}
                        cursor="pointer"
                        onClick={() => handleCopyAddress(card.wagerToken)}
                      />
                    </Flex>
                  </Stack>

                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Wager Amount
                    </Text>
                    <Text fontSize="md">{card.wagerAmount}</Text>
                  </Stack>
                  <Stack spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      Time Per Player
                    </Text>
                    <Text fontSize="md">
                      {formatDuration(Number(card.timePerMove))}
                    </Text>
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
