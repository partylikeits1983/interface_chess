import React from 'react';
import { Text, Progress } from '@chakra-ui/react';

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
  isPlayer0Turn
}) => {
  function formatSecondsToTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
    return formattedTime;
  }

  function padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  // Determine which player's time to show based on the current turn and player color
  const whiteTime = isPlayer0White ? timePlayer0 : timePlayer1;
  const blackTime = isPlayer0White ? timePlayer1 : timePlayer0;

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
              {formatSecondsToTime(whiteTime)}
            </Text>
          </Text>
          <Progress
            size="sm"
            colorScheme="green"
            bg="gray"
            value={whiteTime / timeLimit * 100}
          />
          <Text>
            Time Black ⚫{' '}
            <Text as="span" fontWeight="bold">
              {formatSecondsToTime(blackTime)}
            </Text>
          </Text>
          <Progress
            size="sm"
            colorScheme="green"
            bg="gray"
            value={blackTime / timeLimit * 100}
          />
        </div>
      )}
    </div>
  );
};

export default GameTimer;
