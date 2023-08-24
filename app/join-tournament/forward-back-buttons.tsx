import React, { FC } from 'react';
import { Button } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface ForwardBackButtonsProps {
  onBack: () => void;
  onForward: () => void;
}

const ForwardBackButtons: FC<ForwardBackButtonsProps> = ({
  onBack,
  onForward,
}) => {
  return (
    <div>
      <Button
        leftIcon={<ChevronLeftIcon />}
        onClick={onBack}
        backgroundColor="#1A202C"
        size="sm"
        mr={2}
        _hover={{
          color: '#000000', // Set the text color on hover
          backgroundColor: '#2D3748', // Set the background color on hover
        }}
      />
      <Button
        rightIcon={<ChevronRightIcon />}
        onClick={onForward}
        backgroundColor="#1A202C"
        size="sm"
        _hover={{
          color: '#000000', // Set the text color on hover
          backgroundColor: '#2D3748', // Set the background color on hover
        }}
      />
    </div>
  );
};

export default ForwardBackButtons;
