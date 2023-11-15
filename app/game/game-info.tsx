import React, { useState, useEffect } from 'react';

import { getTokenDetails } from '#/lib/api/token-information';
import { useStateManager } from '#/lib/api/sharedState';

import { CopyIcon } from '@chakra-ui/icons';
import copyIconFeedback from 'ui/copyIconFeedback';

interface GameInfoProps {
  wager: string;
  wagerToken: string;
  wagerAmount: string;
  numberOfGames: string;
  timeLimit: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayerTurn: boolean;
  isPlayer0White: boolean;
}

import { Table, Flex, Text, Box } from '@chakra-ui/react';
import { globalAgent } from 'http';

type TokenDetail = {
  label: string;
  image: string;
};

const GameInfo: React.FC<GameInfoProps> = ({
  wager,
  wagerToken,
  wagerAmount,
  numberOfGames,
  timeLimit,
  isPlayerTurn,
}) => {
  const [globalState, setGlobalState] = useStateManager();

  const [tokenDetail, setTokenDetail] = useState<TokenDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getScoreData() {
      setIsLoading(true);
      const detail = getTokenDetails(globalState.chainID, wagerToken);
      setTokenDetail(detail);

      setIsLoading(false);
    }
    getScoreData();
  }, []);

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

  function formatSecondsToTime(secondsString: string): string {
    const seconds = parseInt(secondsString, 10);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${padZero(hours)} hours ${padZero(
      minutes,
    )} minutes ${padZero(remainingSeconds)} seconds`;
    return formattedTime;
  }

  function padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  async function handleCopyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      copyIconFeedback('Address copied to clipboard');
    } catch (error) {
      copyIconFeedback('Failed to copy address');
    }
  }

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
        //
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
          <CopyIcon
            ml={2}
            cursor="pointer"
            onClick={() => handleCopyAddress(wagerToken)}
            color="white"
          />
        </Flex>
      </Box>
    );
  };

  return (
    <div>
      <Box p={3} border="0.5px solid white">
        {wager !== '' && (
          <div>
            <Table size="xl">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Time Limit</th>
                  <th>Game</th>
                  <th>Your Turn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {tokenDetail ? (
                      <BoxTemplate
                        label="Token"
                        value={
                          tokenDetail.image
                            ? {
                                label: tokenDetail.label,
                                icon: tokenDetail.image,
                              }
                            : formatAddress(wagerToken)
                        }
                      />
                    ) : (
                      'Loading...'
                    )}
                  </td>

                  <td>{formatSecondsToTime(timeLimit.toString())}</td>
                  <td>{numberOfGames}</td>
                  <td>{isPlayerTurn ? 'True' : 'False'}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}
      </Box>
    </div>
  );
};

export default GameInfo;
