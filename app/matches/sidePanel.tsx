import React, { FC } from 'react';
import { Chessboard } from 'react-chessboard';
import { Card } from './types';
import { Button, Stack } from '@chakra-ui/react';

interface CardSidePanelProps {
  card: Card; // Your Card type here
}

const SidePanel: FC<CardSidePanelProps> = ({ card }) => {
  const { matchAddress, player0Address, player1Address, wagerToken } = card;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>
        <Chessboard
          boardOrientation={true ? 'white' : 'black'}
          // onPieceDrop={onDrop}
          // position={game.fen()}
        />
      </div>
      <Stack spacing={2} mt={4}>
        <Button onClick={() => console.log('Button 1 clicked')}>
          Button 1
        </Button>
        <Button onClick={() => console.log('Button 2 clicked')}>
          Button 2
        </Button>
        <Button onClick={() => console.log('Button 3 clicked')}>
          Button 3
        </Button>
      </Stack>
    </div>
  );
};

export default SidePanel;
