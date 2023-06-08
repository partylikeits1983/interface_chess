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
  Button,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import Identicon from 'ui/IdenticonGames';
import { CopyIcon } from '@chakra-ui/icons';

import copyIconFeedback from 'ui/copyIconFeedback';

import SidePanel from './sidePanel';

import { Card } from '../types';

interface Props {
  cards: Card[];
}

interface CardAccordionProps {
  card: Card; // Your Card type here
  account: string | null;

  // ... any other props you need
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
      alert(`Invalid Ethereum address: ${address}`);
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
                <Text fontSize="md">{`Address: ${formatAddress(
                  card.matchAddress,
                )}`}</Text>
              </HStack>

              <HStack spacing="1.5rem">
                {card.isInProgress ? (
                  <Text>In Progress</Text>
                ) : (
                  <Text>Pending</Text>
                )}
                <AccordionIcon />
              </HStack>
            </Flex>
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Flex
            direction={useBreakpointValue({ base: 'column', md: 'row' })}
            alignItems={useBreakpointValue({
              base: 'stretch',
              md: 'flex-start',
            })}
          >
            <Stack
              spacing={2}
              width={useBreakpointValue({ base: '100%', md: '50%' })}
            >
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
                    {Number(account) == Number(card.player0Address)
                      ? formatAddress(card.player1Address)
                      : formatAddress(card.player0Address)}
                  </Text>
                  <CopyIcon
                    ml={2}
                    cursor="pointer"
                    onClick={() =>
                      handleCopyAddress(
                        card.isInProgress
                          ? card.player1Address
                          : card.player0Address,
                      )
                    }
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
                  Time Per Player
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
                  {card.isInProgress
                    ? card.isPlayerTurn
                      ? 'Your turn'
                      : 'Waiting for opponent to move'
                    : Number(card.player1Address) === Number(account)
                    ? 'Pending Your Approval'
                    : 'Waiting for opponent to accept wager'}
                </Text>
              </Stack>
            </Stack>

            <Box
              width={useBreakpointValue({ base: '100%', md: '50%' })}
              marginBottom={useBreakpointValue({ base: 4, md: 0 })}
              order={useBreakpointValue({ base: 2, md: 1 })}
            >
              <SidePanel
                card={card}
                isPendingApproval={
                  !card.isInProgress &&
                  Number(card.player1Address) === Number(account)
                }
              ></SidePanel>
            </Box>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CardAccordion;
