import React from 'react';

interface GameTimerProps {
  wager: string;
  timeLimit: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayer0White: boolean;
  isPlayer0Turn: boolean;
}

import { Text, Progress } from '@chakra-ui/react';

const GameTimer: React.FC<GameTimerProps> = ({
  wager,
  timeLimit,
  timePlayer0,
  timePlayer1,
  isPlayer0White,
  isPlayer0Turn

}) => {
  function formatSecondsToTime(seconds: number): string {
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
      <Text>
        Current Turn: {isPlayer0Turn ? 'Player 0' : 'Player 1'}
      </Text>
      <Text>
        Time White ⚪{' '}
        <Text as="span" fontWeight="bold">
          {/* Display and count down White's time */}
          {formatSecondsToTime((isPlayer0Turn && !isPlayer0White) || (!isPlayer0Turn && isPlayer0White) ? timePlayer0 : timePlayer1)}
        </Text>
      </Text>
      <Progress
        size="sm"
        colorScheme="green"
        bg="gray"
        value={((isPlayer0Turn && !isPlayer0White) || (!isPlayer0Turn && isPlayer0White) ? timePlayer0 : timePlayer1) / timeLimit * 100}
      />
      <Text>
        Time Black ⚫{' '}
        <Text as="span" fontWeight="bold">
          {/* Display and count down Black's time */}
          {formatSecondsToTime((isPlayer0Turn && isPlayer0White) || (!isPlayer0Turn && !isPlayer0White) ? timePlayer1 : timePlayer0)}
        </Text>
      </Text>
      <Progress
        size="sm"
        colorScheme="green"
        bg="gray"
        value={((isPlayer0Turn && isPlayer0White) || (!isPlayer0Turn && !isPlayer0White) ? timePlayer1 : timePlayer0) / timeLimit * 100}
      />
    </div>
  )}
</div>

  );
};
export default GameTimer;
