import React, { FC, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Card } from '../types';
import { Button, Stack, Box, Spinner } from '@chakra-ui/react';

import { Chess } from 'chess.js';

const {
  GetGameMoves,
  GetNumberOfGames,
  IsPlayerWhite,
  PayoutWager,
  CancelWager,
} = require('ui/wallet-ui/api/form');

interface CardSidePanelProps {
  card: Card; // Your Card type here
}

const SidePanel: FC<CardSidePanelProps> = ({ card }) => {
  const { matchAddress, player0Address, player1Address, wagerToken } = card;
  const [isChessboardLoading, setIsChessboardLoading] = useState(false);

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);

  const [wagerAddress, setWagerAddress] = useState('');
  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [numberOfGames, setNumberOfGames] = useState('');

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const getGameMoves = async () => {
      if (card.matchAddress != '') {
        setIsChessboardLoading(true);

        const gameNumberData: Array<Number> = await GetNumberOfGames(
          card.matchAddress,
        );
        const gameNumber = `${gameNumberData[0]} of ${gameNumberData[1]}`;
        setNumberOfGames(gameNumber);

        const movesArray = await GetGameMoves(
          card.matchAddress,
          gameNumberData[0],
        );
        const game = new Chess();

        for (let i = 0; i < movesArray.length; i++) {
          console.log(movesArray[i]);
          game.move(movesArray[i]);
        }
        setGame(game);

        const isPlayerWhite = await IsPlayerWhite(card.matchAddress);
        setPlayerColor(isPlayerWhite);

        setIsChessboardLoading(false);
      } else {
        setIsChessboardLoading(false);
      }
    };
    getGameMoves();
  }, [card]);

  function handleSubmitCancelWager() {
    try {
      // adding await fails to build
      // using useEffect makes everything glitchy
      console.log('handle cancel wager');
      console.log(matchAddress);
      CancelWager(matchAddress);
    } catch (error) {
      console.log(error);
    }
  }

  function handleSubmitPayoutWager() {
    try {
      // adding await fails to build
      // using useEffect makes everything glitchy
      console.log('handle payout wager');
      console.log(matchAddress);
      PayoutWager(matchAddress);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Box width="300px" height="300px" position="relative">
        {isChessboardLoading ? (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          />
        ) : (
          <Chessboard
            boardOrientation={isPlayerWhite ? 'white' : 'black'}
            arePiecesDraggable={false}
            position={game.fen()}
            boardWidth={300} // 100% to fill the box
          />
        )}
      </Box>
      <Stack spacing={4} mt={8}>
        <Link href={`/game/${card.matchAddress}`}>
          <Button
            style={{ width: '250px' }}
            // colorScheme="teal"
            variant="outline"
            color="#fffff" // Set the desired text color
            // backgroundColor="#94febf" // Set the desired background color

            _hover={{
              color: '#000000', // Set the text color on hover
              backgroundColor: '#62ffa2', // Set the background color on hover
            }}
            size="md"
            onClick={() => router.push(`/game/${card.matchAddress}`)}
          >
            Go to Match
          </Button>
        </Link>
        <Button
          onClick={handleSubmitCancelWager}
          style={{ width: '250px' }}
          // colorScheme="teal"
          variant="outline"
          color="#fffff" // Set the desired text color
          // backgroundColor="#94febf" // Set the desired background color

          _hover={{
            color: '#000000', // Set the text color on hover
            backgroundColor: '#62ffa2', // Set the background color on hover
          }}
          size="md"
        >
          Cancel Wager
        </Button>
        <Button
          onClick={handleSubmitPayoutWager}
          style={{ width: '250px' }}
          // colorScheme="teal"
          variant="outline"
          color="#fffff" // Set the desired text color
          // backgroundColor="#94febf" // Set the desired background color

          _hover={{
            color: '#000000', // Set the text color on hover
            backgroundColor: '#62ffa2', // Set the background color on hover
          }}
          size="md"
        >
          Payout Wager
        </Button>
      </Stack>
    </div>
  );
};

export default SidePanel;
