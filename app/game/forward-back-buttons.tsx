import React, { FC } from 'react';
import { Button, Tooltip } from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@chakra-ui/icons';

interface ForwardBackButtonsProps {
  onBackMove: () => void;
  onForwardMove: () => void;
  onBackGame: () => void;
  onForwardGame: () => void;
}

const ForwardBackButtons: FC<ForwardBackButtonsProps> = ({
  onBackMove,
  onForwardMove,
  onBackGame,
  onForwardGame,
}) => {
  return (
    <div>
      {/* Buttons for toggling through games */}

      {/* Buttons for toggling through moves */}
      <Tooltip label="Back game" aria-label="A tooltip">
        <Button
          leftIcon={<ArrowLeftIcon />}
          onClick={onBackGame}
          backgroundColor="#1A202C"
          size="sm"
          mr={2}
          _hover={{
            color: '#000000',
            backgroundColor: '#2D3748',
          }}
        />
      </Tooltip>

      <Tooltip label="Back move" aria-label="A tooltip">
        <Button
          leftIcon={<ChevronLeftIcon />}
          onClick={onBackMove}
          backgroundColor="#1A202C"
          size="sm"
          mr={2}
          _hover={{
            color: '#000000',
            backgroundColor: '#2D3748',
          }}
        />
      </Tooltip>

      <Tooltip label="Forward move" aria-label="A tooltip">
        <Button
          rightIcon={<ChevronRightIcon />}
          onClick={onForwardMove}
          backgroundColor="#1A202C"
          size="sm"
          mr={2}
          _hover={{
            color: '#000000',
            backgroundColor: '#2D3748',
          }}
        />
      </Tooltip>

      <Tooltip label="Forward game" aria-label="A tooltip">
        <Button
          rightIcon={<ArrowRightIcon />}
          onClick={onForwardGame}
          backgroundColor="#1A202C"
          size="sm"
          _hover={{
            color: '#000000',
            backgroundColor: '#2D3748',
          }}
        />
      </Tooltip>
    </div>
  );
};

export default ForwardBackButtons;
