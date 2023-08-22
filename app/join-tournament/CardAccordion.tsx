import React, { useState, useEffect } from 'react';

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
  useBreakpointValue,
  Table,
  Th,
  Tr,
  Td,
  Tbody,
} from '@chakra-ui/react';
import Identicon from 'ui/IdenticonGames';
import { CopyIcon } from '@chakra-ui/icons';

import copyIconFeedback from 'ui/copyIconFeedback';

import { getChainId } from '#/ui/wallet-ui/api/form';

interface TournamentData {
  tournamentNonce: number;
  numberOfPlayers: number;
  players: string[];
  numberOfGames: number;
  token: string;
  tokenAmount: number;
  isInProgress: boolean;
  startTime: number;
  timeLimit: number;
  isComplete: boolean;
}

interface Props {
  cards: TournamentData[];
}

interface CardAccordionProps {
  card: TournamentData;
}

const CardAccordion: React.FC<CardAccordionProps> = ({ card }) => {
  const [token, setToken] = useState('');

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
                <Identicon account={card.players[0]} />
                <Text fontSize="md">{`TournamentID: ${card.tournamentNonce}`}</Text>
              </HStack>

              <HStack spacing="1.5rem">
                <Text></Text>

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
              md: 'flex-center',
            })}
            justifyContent="center"
          >
            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Tournament ID
                  </Td>
                  <Td>{card.tournamentNonce}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Number of Games
                  </Td>
                  <Td>{card.numberOfGames}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Wager Token
                  </Td>
                  <Td>
                    {formatAddress(card.token)}
                    <CopyIcon
                      ml={2}
                      cursor="pointer"
                      onClick={() => handleCopyAddress(card.token)}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Tournament Entry Fee
                  </Td>
                  <Td>
                    {ethers.utils.formatUnits(
                      ethers.BigNumber.from(
                        fromScientificNotation(card.tokenAmount.toString()),
                      ),
                      18,
                    )}
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Wager Time Limit
                  </Td>
                  <Td>{formatDuration(Number(card.timeLimit))}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Player Limit
                  </Td>
                  <Td>{card.numberOfPlayers}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Number of Players waiting
                  </Td>
                  <Td>{card.players.length}</Td>
                </Tr>
              </Tbody>
            </Table>
            <Box
              width={useBreakpointValue({ base: '100%', md: '50%' })}
              marginBottom={useBreakpointValue({ base: 4, md: 0 })}
              order={useBreakpointValue({ base: 2, md: 1 })}
            ></Box>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CardAccordion;
