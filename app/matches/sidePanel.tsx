import React, { FC, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

import Link from 'next/link';

import { Card } from './types';
import { Button, Stack } from '@chakra-ui/react';

import { Chess } from 'chess.js';
import { match } from 'assert';

const { GetGameMoves, GetNumberOfGames } = require('ui/wallet-ui/api/form');

interface CardSidePanelProps {
  card: Card; // Your Card type here
}

const SidePanel: FC<CardSidePanelProps> = ({ card }) => {
  const { matchAddress, player0Address, player1Address, wagerToken } = card;
  const [isChessboardVisible, setIsChessboardVisible] = useState(false);

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);

  const [wagerAddress, setWagerAddress] = useState('');
  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [numberOfGames, setNumberOfGames] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGameMoves = async () => {
      if (card.matchAddress != '') {
        // console.log("HERE")
        console.log(matchAddress);
        console.log(player0Address);
        // console.log(matchAddress);
        // Your async function logic here
        // const movesArray = await GetGameMoves(matchAddress);
        const game = new Chess();

        /*         console.log(movesArray);
        for (let i = 0; i < movesArray.length; i++) {
          console.log(movesArray[i]);
          game.move(movesArray[i]);
        }
        setGame(game);

        console.log(game.fen())

        //const isPlayerWhite = await IsPlayerWhite(wager);
        setPlayerColor(isPlayerWhite);

        const gameNumberData: Array<Number> = await GetNumberOfGames(matchAddress);
        const gameNumber = `${gameNumberData[0]} of ${gameNumberData[1]}`;
        setNumberOfGames(gameNumber);

        setLoading(false);
      } else {
        setLoading(false);
      } */
      }
    };
  });

  useEffect(() => {
    setIsChessboardVisible(true);
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
        <Link href={`/game/${card.matchAddress}`}>
          <Button
            style={{ width: '200px' }}
            colorScheme="teal"
            variant="outline"
            size="md"
          >
            Go to Match
          </Button>
        </Link>
        <Button
          onClick={() => console.log('Button 2 clicked')}
          style={{ width: '200px' }}
          colorScheme="teal"
          variant="outline"
          size="md"
        >
          Cancel Wager
        </Button>
        <Button
          onClick={() => console.log('Button 3 clicked')}
          style={{ width: '200px' }}
          colorScheme="teal"
          variant="outline"
          size="md"
        >
          Payout Wager
        </Button>
      </Stack>
    </div>
  );
};

export default SidePanel;
