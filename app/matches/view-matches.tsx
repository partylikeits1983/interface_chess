'use client';
const { ethers } = require('ethers');
const { GetAllWagers } = require('ui/wallet-ui/api/form');

import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Stack, ChakraProvider } from '@chakra-ui/react';

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
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    async function fetchCards() {
      try {
        const data: any[] = await GetAllWagers();

        console.log(data[0]);

        const cards = Object.values(data).map((input: any[]) => {
          return {
            matchAddress: input[0].toString(),
            opponentAddress: input[1].toString(),
            wagerToken: input[2].toString(),
            wagerAmount: parseInt(input[3].toString()),
            timePerMove: parseInt(input[4].toString()),
            numberOfGames: parseInt(input[5].toString()),
            isPending: input[6],
          };
        });
        // console.log(cards);

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
        <Stack spacing={4}>
          {cards.map((card, index) => (
            <Box
              key={index}
              bg="black"
              border="1px solid white"
              borderRadius="md"
              p={4}
              color="white"
            >
              <Heading as="h3" size="md" mb={2}>
                Match: {card.matchAddress}
              </Heading>
              <Text>Oppenent: {card.opponentAddress}</Text>
              <Text>Wager Token: {card.wagerToken}</Text>
              <Text>Wager Amount: {card.wagerAmount.toString()}</Text>
              <Text>Time Per Move: {card.timePerMove.toString()}</Text>
              <Text>Number of Games: {card.numberOfGames.toString()}</Text>
              <Text>Status: {card.isPending.toString()}</Text>
            </Box>
          ))}
        </Stack>
      </Box>
    </ChakraProvider>
  );
};

export default CardList;
