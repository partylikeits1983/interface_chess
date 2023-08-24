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
  Thead,
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
  ExitTournament,
  StartTournament,
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

interface CardAccordionProps {
  card: TournamentData;
}

const TournamentCard: React.FC<CardAccordionProps> = ({ card }) => {
  const [token, setToken] = useState('');
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);

  const [isLoadingJoin, setIsLoadingJoin] = useState(false);
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const [isLoadingExitTournament, setIsLoadingExitTournament] = useState(false);

  // const [isUserInTournament, setIsUserInTournament] = useState(false);

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

  const HandleClickJoinTournament = async () => {
    setIsLoadingJoin(true);
    await ApproveTournament(card.token, card.tokenAmount);
    await JoinTournament(card.tournamentNonce);
    setIsLoadingJoin(false);
  };

  const HandleClickStartTournament = async () => {
    setIsLoadingStart(true);
    await StartTournament(card.tournamentNonce);
    setIsLoadingStart(false);
  };

  const HandleClickExitTournament = async () => {
    setIsLoadingExitTournament(true);
    await ExitTournament(card.tournamentNonce);
    setIsLoadingExitTournament(false);
  };

  function timeUntilStart(startTime: number): string {
    const now = new Date();
    const targetDate = new Date(startTime * 1000 + 86400 * 1000);
    const difference = targetDate.getTime() - now.getTime();

    console.log(startTime);
    console.log(targetDate);

    if (difference <= 0) {
      return 'Tournament can begin';
    }

    // Calculate the days, hours, minutes, and seconds
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} hours ${minutes} minutes until tournament can begin`;
  }

  type DataField = {
    label: string;
    value: string | number;
    hasIcon?: boolean;
  };

  type BoxTemplateProps = {
    label: string;
    value: string | number;
    hasIcon?: boolean;
  };

  const dataFields: DataField[] = [
    { label: 'Tournament ID', value: card.tournamentNonce },
    { label: 'Number of Games Per Match', value: card.numberOfGames },
    { label: 'Wager Token', value: formatAddress(card.token), hasIcon: true },
    {
      label: 'Tournament Pool Size',
      value: card.tokenAmount * card.players.length,
    },
    { label: 'Tournament Entry Fee', value: card.tokenAmount.toString() },
    {
      label: 'Wager Time Limit',
      value: formatDuration(Number(card.timeLimit)),
    },
    { label: 'Player Limit', value: card.numberOfPlayers },
    { label: 'Time Until Start', value: timeUntilStart(card.startTime) },
  ];

  const BoxTemplate: React.FC<BoxTemplateProps> = ({
    label,
    value,
    hasIcon,
  }) => (
    <Box
      bg="black"
      p={3}
      h="60px"
      rounded="md"
      my={1}
      border="0.5px solid white"
      display="flex"
      alignItems="center"
    >
      <Text fontWeight="bold" color="white" fontSize="sm" mr={3}>
        {label}
      </Text>
      <Flex alignItems="center" flex="1">
        <Text color="white" fontSize="sm">
          {value}
        </Text>
        {hasIcon && (
          <CopyIcon
            ml={2}
            cursor="pointer"
            onClick={() => handleCopyAddress(card.token)}
            color="white"
          />
        )}
      </Flex>
    </Box>
  );

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Flex justify="space-between" alignItems="center" w="full">
              <HStack spacing="1.5rem">
                <Identicon account={card.players[0]} />
                <Text fontSize="md">{`Tournament # ${card.tournamentNonce}`}</Text>
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
            <Flex width="100%" maxW="800px" mx="auto" wrap="wrap" mb={4}>
              {dataFields.map((field, index) => (
                <Box key={index} width={['100%', '50%']} px={2}>
                  <BoxTemplate {...field} />
                </Box>
              ))}

              <Box width={['100%', '100%']} px={2}>
                <Box
                  bg="black"
                  p={3}
                  rounded="md"
                  my={3}
                  border="1px solid white"
                  maxHeight="150px"
                  overflowY="auto"
                >
                  <Text fontWeight="bold" color="white" fontSize="sm">
                    Player Addresses
                  </Text>
                  <Table variant="simple" size="xs">
                    <Thead>
                      <Tr>
                        <Td color="white" fontWeight="bold">
                          Address
                        </Td>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {card.players.map((playerAddress, index) => (
                        <Tr key={index}>
                          <Td color="white">{playerAddress}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </Flex>

            <Stack spacing="4" direction="column" mb={4}>
              <Button
                color="#000000"
                backgroundColor="#94febf"
                variant="solid"
                size="lg"
                loadingText="Submitting Transaction"
                onClick={() => HandleClickJoinTournament()}
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

              <Button
                color="#000000"
                backgroundColor="#94febf"
                variant="solid"
                size="lg"
                loadingText="Submitting Transaction"
                onClick={() => HandleClickStartTournament()}
                _hover={{
                  color: '#000000',
                  backgroundColor: '#62ffa2',
                }}
              >
                Start Tournament
                <div
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    textAlign: 'center',
                    marginLeft: '8px',
                  }}
                >
                  {isLoadingStart ? (
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

              <Button
                color="#000000"
                backgroundColor="#94febf"
                variant="solid"
                size="lg"
                loadingText="Submitting Transaction"
                onClick={() => HandleClickExitTournament()}
                _hover={{
                  color: '#000000',
                  backgroundColor: '#62ffa2',
                }}
              >
                Exit Tournament
                <div
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    textAlign: 'center',
                    marginLeft: '8px',
                  }}
                >
                  {isLoadingExitTournament ? (
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
            </Stack>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default TournamentCard;