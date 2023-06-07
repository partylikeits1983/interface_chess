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
        backgroundColor="#94febf"
        size="sm"
        mr={2}
        _hover={{
          color: '#000000', // Set the text color on hover
          backgroundColor: '#62ffa2', // Set the background color on hover
        }}
      />
      <Button
        rightIcon={<ChevronRightIcon />}
        onClick={onForward}
        backgroundColor="#94febf"
        size="sm"
        _hover={{
          color: '#000000', // Set the text color on hover
          backgroundColor: '#62ffa2', // Set the background color on hover
        }}
      />
    </div>
  );
};

export default ForwardBackButtons;
