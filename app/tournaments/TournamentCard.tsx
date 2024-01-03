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
  GetWagerAddressTournament,
  JoinTournament,
  StartTournament,
  HaveAllGamesBeenPlayedInTournament,
  GetTournamentScore,
  GetIsTournamentEnded,
  PayoutTournament,
} from '#/lib/api/form';

import { getTokenDetails } from '#/lib/api/token-information';
import { useStateManager } from '#/lib/api/sharedState';

import { TournamentData } from '#/lib/api/form';

interface CardAccordionProps {
  card: TournamentData;
}

type PlayerScores = {
  [key: string]: number;
};

const TournamentCard: React.FC<CardAccordionProps> = ({ card }) => {
  const [token, setToken] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isTournamentEnded, setIsTournamentEnded] = useState(false);

  // State to store scores
  const [playerScores, setPlayerScores] = useState<PlayerScores>({});

  const [wagerAddress, setWagerAddresses] = useState<string[]>([]);

  type TokenDetail = {
    label: string;
    image: string;
  };
  const [chainID, setChainID] = useState(0);
  const [tokenDetail, setTokenDetail] = useState<TokenDetail | null>(null);

  const [globalState, setGlobalState] = useStateManager();

  useEffect(() => {
    async function getScoreData() {
      setIsLoading(true);
      if (!globalState.useAPI) {
        const data = await GetTournamentScore(card.tournamentNonce);

        const isEnded = await GetIsTournamentEnded(card.tournamentNonce);

        if (isEnded) {
          setIsTournamentEnded(true);
        }
        // Process data to map player addresses to their scores
        const scoresObj: PlayerScores = {};
        for (let i = 0; i < data[0].length; i++) {
          scoresObj[data[0][i]] = data[1][i];
        }

        setPlayerScores(scoresObj);

        const chainData = await getChainId();
        setChainID(Number(chainData));

        const wagerAddresses = await GetWagerAddressTournament(
          card.tournamentNonce,
        );
        setWagerAddresses(wagerAddresses);

        // pass chainData not chainId... sigh
        const detail = getTokenDetails(chainData, card.token);
        setTokenDetail(detail);
      } else {
        setIsTournamentEnded(false);
        const detail = getTokenDetails(421614, card.token);
        setTokenDetail(detail);
      }
      setIsLoading(false);
    }
    getScoreData();
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

  const HandleClickHandlePayoutTournament = async () => {
    setIsLoading(true);
    await PayoutTournament(card.tournamentNonce);
    setIsLoading(false);
  };

  function timeUntilEndTime(endTime: number): string {
    // Get current unix timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000); // Divided by 1000 to convert from ms to s

    const difference = endTime - currentTimestamp;

    // Calculate total minutes
    const totalMinutes = Math.abs(Math.floor(difference / 60));
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    // Adjust hours for negative difference
    if (difference < 0) {
      hours = -hours;
    }

    return `${hours} hours ${minutes} minutes`;
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
      value: (
        card.tokenAmount * card.joined_players.length +
        card.prizePool
      ).toString(), // convert to string
    },
    { label: 'Tournament Entry Fee', value: card.tokenAmount.toString() },
    {
      label: 'Time Limit',
      value: formatDuration(Number(card.timeLimit)), // assuming formatDuration returns a string
    },
    { label: 'Player Limit', value: card.numberOfPlayers.toString() }, // convert to string
    {
      label: 'Ends In',
      value: timeUntilEndTime(card.startTime + card.timeLimit + 86400),
    },
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
                <Identicon account={card.joined_players[0]} />
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
              {isLoading ? (
                <>
                  <Spinner></Spinner>
                </>
              ) : (
                <>
                  <Box width={['100%', '100%']} px={2}>
                    {/* Player Addresses Table */}
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
                            <Td color="white" fontWeight="bold">
                              Score
                            </Td>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {card.joined_players.map((playerAddress, index) => (
                            <Tr key={index}>
                              <Td color="white">
                                <a
                                  href={`https://arbiscan.io/address/${playerAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#42ff72' }}
                                >
                                  {playerAddress}
                                </a>
                              </Td>
                              <Td color="white">
                                {playerScores[playerAddress] || 'N/A'}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>

                    {/* Wager Addresses Table */}
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
                        Game Addresses
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
                          {wagerAddress.map((address, index) => (
                            <Tr key={index}>
                              <Td color="white">
                                <a
                                  href={`/game/${address}`}
                                  style={{ color: '#42ff72' }}
                                >
                                  {address}
                                </a>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>
                </>
              )}
            </Flex>

            <HStack spacing="4" direction={{ base: 'column', md: 'row' }}>
              {isTournamentEnded ? (
                <>
                  <Button
                    flex="1"
                    color="#000000"
                    backgroundColor="#94febf"
                    variant="solid"
                    size="lg"
                    loadingText="Submitting Transaction"
                    onClick={() => HandleClickHandlePayoutTournament()}
                    _hover={{
                      color: '#000000',
                      backgroundColor: '#62ffa2',
                    }}
                  >
                    End Tournament and Handle Payout
                    <div
                      style={{
                        display: 'inline-block',
                        width: '24px',
                        textAlign: 'center',
                        marginLeft: '8px',
                      }}
                    >
                      {isLoading ? (
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
                <></>
              )}
            </HStack>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default TournamentCard;
