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
  Button,
  Table,
  Th,
  Tr,
  Td,
  Tbody,
  Spinner,
} from '@chakra-ui/react';
import Identicon from 'ui/IdenticonGames';
import { CopyIcon } from '@chakra-ui/icons';

import copyIconFeedback from 'ui/copyIconFeedback';

import {
  getChainId,
  ApproveTournament,
  JoinTournament,
} from '#/ui/wallet-ui/api/form';

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
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);

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

  const HandleClickCreateTournament = async () => {
    setIsLoadingJoin(true);
    await ApproveTournament(card.token, card.tokenAmount);
    await JoinTournament(card.tournamentNonce);
    setIsLoadingJoin(false);
  };

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
            direction="column" // Set direction to column
            alignItems="center"
            justifyContent="center"
            height="100%"
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
                    Number of Games Per Match
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
                    Tournament Pool Size
                  </Td>
                  <Td>{card.tokenAmount * card.players.length}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold" color="gray.500">
                    Tournament Entry Fee
                  </Td>
                  <Td>{card.tokenAmount.toString()}</Td>
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
                {card.players.map((playerAddress, index) => (
                  <Tr key={index}>
                    <Td fontWeight="bold" color="gray.500">
                      {index === 0 ? 'Player Addresses' : ''}
                    </Td>
                    <Td>{playerAddress}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <HStack spacing="4" direction={{ base: 'column', md: 'row' }}>
              <Button
                flex="1"
                color="#000000"
                backgroundColor="#94febf"
                variant="solid"
                size="lg"
                loadingText="Submitting Transaction"
                onClick={() => HandleClickCreateTournament()}
                _hover={{
                  color: '#000000',
                  backgroundColor: '#62ffa2',
                }}
              >
                Join Tournament
                <div
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    textAlign: 'center',
                    marginLeft: '8px',
                  }}
                >
                  {isLoadingJoin ? (
                    <Spinner
                      thickness="2px"
                      speed="0.85s"
                      emptyColor="gray.800"
                      color="gray.400"
                      size="md"
                    />
                  ) : null}
                </div>
              </Button>
            </HStack>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CardAccordion;
