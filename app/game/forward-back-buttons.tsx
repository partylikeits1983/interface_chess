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
      />
      <Button
        rightIcon={<ChevronRightIcon />}
        onClick={onForward}
        backgroundColor="#94febf"
        size="sm"
      />
    </div>
  );
};

export default ForwardBackButtons;
