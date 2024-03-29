import React from 'react';
import { Text, Progress, Box } from '@chakra-ui/react';

interface GameTimerProps {
  wager: string;
  timeLimit: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayer0White: boolean;
  isPlayer0Turn: boolean;
}

const GameTimer: React.FC<GameTimerProps> = ({
  wager,
  timeLimit,
  timePlayer0,
  timePlayer1,
  isPlayer0White,
  isPlayer0Turn,
}) => {
  function formatSecondsToTime(seconds: number): string {
    // Check if the input seconds is a negative number
    if (seconds < 0) {
      return '00:00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(
      remainingSeconds,
    )}`;

    return formattedTime;
  }

  function padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  // Determine which player's time to show based on the current turn and player color
  const whiteTime = isPlayer0White ? timePlayer0 : timePlayer1;
  const blackTime = isPlayer0White ? timePlayer1 : timePlayer0;

  // console.log("GAME TIMER", isPlayer0White, isPlayer0Turn );
  return (
<div>
  {wager !== '' && (
    <Box border="0.1px solid" borderColor="white" p={6}>
      <Text>
        Time White ⚪{' '}
        <Text
          as="span"
          fontWeight="bold"
          style={{ width: '150px', display: 'inline-block' }}
        >
          {formatSecondsToTime(whiteTime)}
        </Text>
      </Text>
      <Progress
        size="sm"
        colorScheme="green"
        bg="gray"
        value={(whiteTime / timeLimit) * 100}
      />
      <Text>
        Time Black ⚫{' '}
        <Text
          as="span"
          fontWeight="bold"
          style={{ width: '150px', display: 'inline-block' }}
        >
          {formatSecondsToTime(blackTime)}
        </Text>
      </Text>
      <Progress
        size="sm"
        colorScheme="green"
        bg="gray"
        value={(blackTime / timeLimit) * 100}
      />
    </Box>
  )}
</div>
  );
};

export default GameTimer;
