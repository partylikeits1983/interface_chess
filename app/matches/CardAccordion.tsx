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
  useBreakpointValue,
  getToken,
} from '@chakra-ui/react';

import { getTokenDetails } from '#/lib/api/token-information';
import { useStateManager } from '#/lib/api/sharedState';

import Identicon from 'ui/IdenticonGames';

import { CopyIcon } from '@chakra-ui/icons';
import copyIconFeedback from 'ui/copyIconFeedback';

import SidePanel from './sidePanel';

import { Card } from '../types';

interface Props {
  cards: Card[];
}

interface CardAccordionProps {
  card: Card;
  account: string | null;
}

const CardAccordion: React.FC<CardAccordionProps> = ({ card, account }) => {
  const [globalState, setGlobalState] = useStateManager();

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

  const tokenDetails = getTokenDetails(globalState.chainID, card.wagerToken);

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
                <Text fontSize="md">
                  {card.isComplete
                    ? 'Wager completed ✅'
                    : card.isInProgress
                    ? card.isPlayerTurn
                      ? 'Your turn 🟢'
                      : 'Waiting for opponent to move 🔴'
                    : Number(card.player1Address) === Number(account)
                    ? 'Pending Your Approval 🔵'
                    : 'Waiting for opponent to accept wager 🔵'}
                </Text>
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
            <div
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#000',
                borderRadius: '8px',
              }}
            >
              {[
                {
                  label: 'Match Address',
                  value: formatAddress(card.matchAddress),
                },
                {
                  label: 'Opponent Address',
                  value:
                    Number(account) == Number(card.player0Address)
                      ? formatAddress(card.player1Address)
                      : formatAddress(card.player0Address),
                },
                {
                  label: 'Wager Token',
                  value: tokenDetails ? (
                    <>
                      <img
                        src={tokenDetails.image}
                        alt="token icon"
                        style={{
                          marginLeft: '0px',
                          marginRight: '6px', // Added this line for spacing
                          height: '24px',
                          width: '24px',
                        }}
                      />
                      <Text fontSize="md">{tokenDetails.label}</Text>
                    </>
                  ) : (
                    formatAddress(card.wagerToken)
                  ),
                },
                {
                  label: 'Wager Amount',
                  value: card.wagerAmount.toString(),
                },
                {
                  label: 'Wager Time Limit',
                  value: formatDuration(Number(card.timeLimit)),
                },
                { label: 'Number of Games', value: card.numberOfGames },
                {
                  label: 'Status',
                  value: card.isInProgress
                    ? card.isPlayerTurn
                      ? 'Your turn'
                      : 'Waiting for opponent to move'
                    : Number(card.player1Address) === Number(account)
                    ? 'Pending Your Approval'
                    : 'Waiting for opponent to accept wager',
                },
              ].map((item) => (
                <Flex
                  key={item.label}
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Flex
                    alignItems="center"
                    justifyContent="flex-start"
                    width="50%"
                  >
                    <Text fontSize="sm" fontWeight="bold" color="gray.500">
                      {item.label}
                    </Text>
                  </Flex>
                  <Flex
                    alignItems="center"
                    justifyContent="flex-start"
                    width="50%"
                  >
                    {item.value}
                    {[
                      'Match Address',
                      'Opponent Address',
                      'Wager Token',
                    ].includes(item.label) && (
                      <CopyIcon
                        ml={2}
                        cursor="pointer"
                        onClick={() =>
                          handleCopyAddress(
                            typeof item.value === 'string' ? card.matchAddress : '',
                          )
                        }
                      />
                    )}
                  </Flex>
                </Flex>
              ))}
            </div>

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
