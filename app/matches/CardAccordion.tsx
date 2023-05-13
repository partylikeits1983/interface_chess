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
  Button,
  HStack,
} from '@chakra-ui/react';
import Identicon from 'ui/IdenticonGames';
import { CopyIcon } from '@chakra-ui/icons';

interface Card {
  matchAddress: string;
  player0Address: string;
  player1Address: string;
  wagerToken: string;
  wagerAmount: number;
  timePerMove: number;
  numberOfGames: number;
  isInProgress: boolean;
  isPlayerTurn: boolean;
}

interface Props {
  cards: Card[];
}

interface CardAccordionProps {
  card: Card; // Your Card type here
  account: string | null;
  isLoadingApproval: boolean;
  HandleClickApprove: Function; // Update with the actual type
  // ... any other props you need
}

const CardAccordion: React.FC<CardAccordionProps> = ({
  card,
  account,
  isLoadingApproval,
  HandleClickApprove,
}) => {
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
          <Stack spacing={2}>
            <Stack spacing={1}>
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

            <Stack spacing={1}>
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
            <Stack spacing={1}>
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
            <Stack spacing={1}>
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
                {card.isInProgress
                  ? card.isPlayerTurn
                    ? 'Your turn'
                    : 'Waiting for opponent to move'
                  : Number(card.player1Address) === Number(account)
                  ? 'Pending approval'
                  : 'Waiting for opponent to accept wager'}
              </Text>
            </Stack>
            {!card.isInProgress &&
              Number(card.player1Address) === Number(account) && (
                <Button
                  colorScheme="green"
                  size="md"
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
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CardAccordion;
