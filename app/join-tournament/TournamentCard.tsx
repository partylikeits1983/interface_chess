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
import { getTokenDetails } from '#/ui/wallet-ui/api/token-information';

import {
  getChainId,
  ApproveTournament,
  JoinTournament,
  ExitTournament,
  StartTournament,
  GetIsUserInTournament,
  GetCanTournamentBegin,
} from '#/ui/wallet-ui/api/form';

import { useStateManager } from 'ui/wallet-ui/api/sharedState';

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

  const [isUserInTournament, setIsUserInTournament] = useState(false);
  const [canTournamentBegin, setCanTournamentBegin] = useState(false);

  const [chainID, setChainID] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [globalState, setGlobalState] = useStateManager();

  type TokenDetail = {
    label: string;
    image: string;
  };

  const [tokenDetail, setTokenDetail] = useState<TokenDetail | null>(null);
  useEffect(() => {
    async function getUserIsInTournament() {
      console.log('globstat', globalState.useAPI);

      setIsLoading(true);
      if (!globalState.useAPI) {
        const resultIsInTournament = await GetIsUserInTournament(
          card.tournamentNonce,
        );

        alert(resultIsInTournament);

        const resultCanBegin = await GetCanTournamentBegin(
          card.tournamentNonce,
        );
        const chainData = await getChainId();

        setIsUserInTournament(Boolean(resultIsInTournament));
        setCanTournamentBegin(Boolean(resultCanBegin));

        setChainID(Number(chainData));

        const detail = getTokenDetails(chainData, card.token);
        setTokenDetail(detail);
        setIsLoading(false);
      } else {
        setIsUserInTournament(false);
        setCanTournamentBegin(false);
      }
      setIsLoading(false);
    }
    getUserIsInTournament();
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

  function formatAddress(address?: string): string {
    if (typeof address !== 'string') {
      return 'Invalid input';
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      // alert(`Invalid Ethereum address: ${address}`);
      return 'Invalid address';
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

  async function handleCopyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      copyIconFeedback('Tournament Link copied to clipboard');
    } catch (error) {
      copyIconFeedback('Failed to copy');
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

    return `${hours} hours ${minutes} minutes until start`;
  }

  type DataField = {
    label: string;
    value: string | { label: string; icon: string | null };
    hasIcon?: boolean;
  };

  const dataFields: DataField[] = [
    { label: 'Tournament ID', value: card.tournamentNonce.toString() }, // convert to string
    {
      label: 'Number of Games Per Match',
      value: card.numberOfGames.toString(),
    }, // convert to string
    {
      label: 'Wager Token',
      value: {
        label: formatAddress(card.token),
        icon: tokenDetail ? tokenDetail.image : null,
      },
      hasIcon: true,
    },
    {
      label: 'Tournament Pool Size',
      value: (card.tokenAmount * card.players.length).toString(), // convert to string
    },
    { label: 'Tournament Entry Fee', value: card.tokenAmount.toString() },
    {
      label: 'Wager Time Limit',
      value: formatDuration(Number(card.timeLimit)), // assuming formatDuration returns a string
    },
    { label: 'Player Limit', value: card.numberOfPlayers.toString() }, // convert to string
    { label: 'Time Until Start', value: timeUntilStart(card.startTime) }, // assuming timeUntilStart returns a string
  ];

  type BoxTemplateProps = {
    label: string;
    value: string | { label: string; icon: string | null };
    hasIcon?: boolean;
  };

  const BoxTemplate: React.FC<BoxTemplateProps> = ({
    label,
    value,
    hasIcon,
  }) => {
    let displayValue: string;
    let iconUrl: string | null = null;

    if (typeof value === 'object' && 'label' in value) {
      displayValue =
        tokenDetail && tokenDetail.label ? tokenDetail.label : value.label;
      iconUrl = value.icon;
    } else {
      displayValue = value.toString();
    }

    return (
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
            {displayValue}
          </Text>
          {iconUrl && (
            <img
              src={iconUrl}
              alt="token icon"
              style={{ marginLeft: '8px', height: '24px', width: '24px' }}
            />
          )}
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
  };

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
            {isLoading ? (
              <>
                <Spinner></Spinner>
              </>
            ) : (
              <>
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
              </>
            )}

            <Stack spacing="4" direction="column" mb={4}>
              {isUserInTournament ? (
                <>
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
                </>
              ) : (
                <>
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
                </>
              )}
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
            </Stack>
          </Flex>

          <Box width={['100%', '100%']} px={2}>
            <Box
              bg="black"
              p={3}
              rounded="md"
              my={0}
              maxHeight="150px"
              overflowY="auto"
            >
              <Box display="flex" alignItems="flex-start">
                <Text
                  fontWeight="bold"
                  color="white"
                  fontSize="sm"
                  marginRight={2}
                >
                  🔗 Click to copy tournament link:
                </Text>

                <Text
                  color="blue.500"
                  onClick={() =>
                    handleCopyLink(
                      `app.chess.fish/join-tournament/${card.tournamentNonce}`,
                    )
                  }
                  cursor="pointer"
                >
                  app.chess.fish/join-tournament/{card.tournamentNonce}
                </Text>
              </Box>
            </Box>
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default TournamentCard;
