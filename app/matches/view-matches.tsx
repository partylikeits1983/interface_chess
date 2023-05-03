'use client';
const { ethers } = require('ethers');
const { getAllWagers } = require('ui/wallet-ui/api/form');

import React from 'react';
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

const CardList: React.FC<Props> = ({ cards }) => {
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
              <Text>Wager Amount: {card.wagerAmount}</Text>
              <Text>Time Per Move: {card.timePerMove}</Text>
              <Text>Number of Games: {card.numberOfGames}</Text>
              <Text>Status: {card.isPending}</Text>
            </Box>
          ))}
        </Stack>
      </Box>
    </ChakraProvider>
  );
};

export default CardList;
