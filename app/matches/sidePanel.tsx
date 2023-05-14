import React, { FC, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

import { Card } from './types';
import { Button, Stack } from '@chakra-ui/react';

interface CardSidePanelProps {
  card: Card; // Your Card type here
}

const SidePanel: FC<CardSidePanelProps> = ({ card }) => {
  const { matchAddress, player0Address, player1Address, wagerToken } = card;
  const [isChessboardVisible, setIsChessboardVisible] = useState(false);

  useEffect(() => {
    setIsChessboardVisible(true);
    console.log('HERE');
  }, []);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {isChessboardVisible && (
        <div>
          <Chessboard
            boardOrientation={true ? 'white' : 'black'}
            arePiecesDraggable={false}
            position={'start'}
            boardWidth={300}
          />
        </div>
      )}
      <Stack spacing={4} mt={8}>
        <Button
          onClick={() => console.log('Button 1 clicked')}
          style={{ width: '200px' }}
        >
          Button 1
        </Button>
        <Button
          onClick={() => console.log('Button 2 clicked')}
          style={{ width: '200px' }}
        >
          Button 2
        </Button>
        <Button
          onClick={() => console.log('Button 3 clicked')}
          style={{ width: '200px' }}
        >
          Button 3
        </Button>
      </Stack>
    </div>
  );
};

export default SidePanel;
