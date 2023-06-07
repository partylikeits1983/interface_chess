import React from 'react';

interface GameTimerProps {
  wager: string;
  timeLimit: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayerTurn: boolean;
  isPlayer0White: boolean;
}

import { Text, Progress } from '@chakra-ui/react';

const GameTimer: React.FC<GameTimerProps> = ({
  wager,
  timeLimit,
  timePlayer0,
  timePlayer1,
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
          {isPlayer0White ? (
            <>
              <Text>
                Time White:{' '}
                {formatSecondsToTime(
                  timePlayer0 > 0 ? timePlayer0.toString() : '0',
                )}
              </Text>
              <Progress
                colorScheme="green"
                bg="gray"
                value={timePlayer0 > 0 ? (timePlayer0 / timeLimit) * 100 : 0}
              />
              <Text>
                Time Black:{' '}
                {formatSecondsToTime(
                  timePlayer1 > 0 ? timePlayer1.toString() : '0',
                )}
              </Text>
              <Progress
                colorScheme="green"
                bg="gray"
                value={timePlayer1 > 0 ? (timePlayer1 / timeLimit) * 100 : 0}
              />
            </>
          ) : (
            <>
              <Text>
                Time White:{' '}
                {formatSecondsToTime(
                  timePlayer1 > 0 ? timePlayer1.toString() : '0',
                )}
              </Text>
              <Progress
                colorScheme="green"
                bg="gray"
                value={timePlayer1 > 0 ? (timePlayer1 / timeLimit) * 100 : 0}
              />
              <Text>
                Time Black:{' '}
                {formatSecondsToTime(
                  timePlayer0 > 0 ? timePlayer0.toString() : '0',
                )}
              </Text>
              <Progress
                colorScheme="green"
                bg="gray"
                value={timePlayer0 > 0 ? (timePlayer0 / timeLimit) * 100 : 0}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default GameTimer;
