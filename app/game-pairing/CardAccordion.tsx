import React from 'react';

const { ethers } = require('ethers');

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Text,
  Flex,
  Box,
  HStack,
} from '@chakra-ui/react';

import copyIconFeedback from 'ui/copyIconFeedback';

import Identicon from 'ui/IdenticonGames';
import { CopyIcon } from '@chakra-ui/icons';

import SidePanel from './sidePanel';

import { Card } from '../types';
import { handleClientScriptLoad } from 'next/script';

interface Props {
  cards: Card[];
}

interface CardAccordionProps {
  card: Card;
  account: string | null;
}

const CardAccordion: React.FC<CardAccordionProps> = ({ card, account }) => {
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
      // alert(`Invalid Ethereum address: ${address}`);
    }
    return `${address.substr(0, 6)}...${address.substr(-8)}`;
  }

  async function handleCopyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      copyIconFeedback('Address copied to clipboard');
    } catch (error) {
      copyIconFeedback('Failed to copy address');
    }
  }

  function fromScientificNotation(n: string): string {
    if (!n.includes('e')) {
      return n;
    }
    let sign = +n < 0 ? '-' : '',
      coefficients = n.replace('-', '').split('e'),
      e = Number(coefficients.pop()),
      zeros = '',
      decimalPointIndex = coefficients[0].indexOf('.');

    if (decimalPointIndex !== -1) {
      let decimalPart = coefficients[0].split('.')[1];
      coefficients[0] = coefficients[0].substring(0, decimalPointIndex);
      zeros =
        decimalPart.length > e
          ? '.' + decimalPart.substring(0, decimalPart.length - e)
          : '';
      e -= decimalPart.length;
    }

    while (e-- > 0) zeros += '0';

    return sign + coefficients[0] + zeros;
  }

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Flex justify="space-between" alignItems="center" w="full">
              <HStack spacing="1.5rem">
                <Identicon account={card.matchAddress} />
                <Text fontSize="md">{`Wager Address: ${formatAddress(
                  card.matchAddress,
                )}`}</Text>
              </HStack>

              <HStack spacing="1.5rem">
                <Text fontSize="md">
                  {Number(account) == Number(card.player0Address)
                    ? 'Your Wager'
                    : ''}
                </Text>
                <AccordionIcon />
              </HStack>
            </Flex>
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Flex justify="space-between" direction="row">
            <Stack spacing={2}>
              <Stack spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Match Address
                </Text>
                <Flex alignItems="center">
                  <Text fontSize="md">{formatAddress(card.matchAddress)}</Text>
                  <CopyIcon
                    ml={2}
                    cursor="pointer"
                    onClick={() => handleCopyAddress(card.matchAddress)}
                  />
                </Flex>
              </Stack>

              <Stack spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Opponent Address
                </Text>
                <Flex alignItems="center">
                  <Text fontSize="md">
                    {formatAddress(card.player0Address)}
                  </Text>
                  <CopyIcon
                    ml={2}
                    cursor="pointer"
                    onClick={() => handleCopyAddress(card.player0Address)}
                  />
                </Flex>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Wager Token
                </Text>
                <Flex alignItems="center">
                  <Text fontSize="md">{formatAddress(card.wagerToken)}</Text>
                  <CopyIcon
                    ml={2}
                    cursor="pointer"
                    onClick={() => handleCopyAddress(card.wagerToken)}
                  />
                </Flex>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Wager Amount
                </Text>
                <Text fontSize="md">
                  {ethers.utils.formatUnits(
                    ethers.BigNumber.from(
                      fromScientificNotation(card.wagerAmount.toString()),
                    ),
                    18,
                  )}
                </Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Wager Time Limit
                </Text>
                <Text fontSize="md">
                  {formatDuration(Number(card.timeLimit))}
                </Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Number of Games
                </Text>
                <Text fontSize="md">{card.numberOfGames}</Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                  Status
                </Text>
                <Text fontSize="md">
                  {Number(card.player1Address) === Number(account)
                    ? 'Waiting to find opponent'
                    : 'Waiting to find opponent'}
                </Text>
              </Stack>
            </Stack>

            <Box width="50%">
              <SidePanel card={card} account={account}></SidePanel>
            </Box>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CardAccordion;
