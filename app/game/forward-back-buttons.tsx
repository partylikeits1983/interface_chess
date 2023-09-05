import React, { FC } from 'react';
import { Button } from '@chakra-ui/react';
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
      <Button
        rightIcon={<ArrowRightIcon />}
        onClick={onForwardGame}
        backgroundColor="#1A202C"
        size="sm"
        mr={2}
        _hover={{
          color: '#000000',
          backgroundColor: '#2D3748',
        }}
      />

      {/* Buttons for toggling through moves */}
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
      <Button
        rightIcon={<ChevronRightIcon />}
        onClick={onForwardMove}
        backgroundColor="#1A202C"
        size="sm"
        _hover={{
          color: '#000000',
          backgroundColor: '#2D3748',
        }}
      />
    </div>
  );
};

export default ForwardBackButtons;
