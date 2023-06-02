import React from 'react';

interface GameInfoProps {
  wager: string;
  wagerAmount: string;
  numberOfGames: string;
  timeLimit: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayerTurn: boolean;
  isPlayer0White: boolean;
}

import {
  Flex,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

const GameInfo: React.FC<GameInfoProps> = ({
  wager,
  wagerAmount,
  numberOfGames,
  timeLimit,
  timePlayer0,
  timePlayer1,
  isPlayerTurn,
  isPlayer0White,
}) => {
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

  return (
    <div>
      {wager !== '' && (
        <div>
          <Table size="md">
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
                <td>{wagerAmount} DAI</td>
                <td>{formatSecondsToTime(timeLimit.toString())}</td>
                <td>{numberOfGames}</td>
                <td>{isPlayerTurn ? 'True' : 'False'}</td>
              </tr>
            </tbody>
          </Table>

          {isPlayer0White ? (
            <>
              <Text>
                Time Remaining White:{' '}
                {formatSecondsToTime(timePlayer0.toString())}
              </Text>
              <Text>
                Time Remaining Black:{' '}
                {formatSecondsToTime(timePlayer1.toString())}
              </Text>
            </>
          ) : (
            <>
              <Text>
                Time Remaining White:{' '}
                {formatSecondsToTime(timePlayer1.toString())}
              </Text>
              <Text>
                Time Remaining Black:{' '}
                {formatSecondsToTime(timePlayer0.toString())}
              </Text>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GameInfo;
