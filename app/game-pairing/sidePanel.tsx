import React, { FC, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

import Link from 'next/link';

import { Card } from '../types';
import { Button, Stack, Box, Spinner } from '@chakra-ui/react';

import { Chess } from 'chess.js';

import { checkMetaMaskConnection } from '#/lib/api/sharedState';

const {
  AcceptWagerAndApprove,
  AcceptWagerConditions,
} = require('../../lib/api/form');

const {
  GetNumberOfGames,
  GetNumberOfGames_NOMETAMASK,
} = require('../../lib/api/form');

interface CardSidePanelProps {
  card: Card; // Your Card type here
  account: string | null;
}

const SidePanel: FC<CardSidePanelProps> = ({ card, account }) => {
  const [isChessboardLoading, setIsChessboardLoading] = useState(false);

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);

  const [wagerAddress, setWagerAddress] = useState('');
  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [numberOfGames, setNumberOfGames] = useState('');

  const [loading, setLoading] = useState(true);

  const [isLoadingApproval, setIsLoadingApproval] = useState(false);

  useEffect(() => {
    const getGameMoves = async () => {
      if (card.matchAddress != '') {
        setIsChessboardLoading(true);

        const game = new Chess();
        setGame(game);

        const hasMetamask = await checkMetaMaskConnection();
        if (hasMetamask) {
          setPlayerColor('white');

          const gameNumberData: Array<Number> = await GetNumberOfGames(
            card.matchAddress,
          );
          const gameNumber = `${gameNumberData[0]} of ${gameNumberData[1]}`;
          setNumberOfGames(gameNumber);
        } else {
          setPlayerColor('white');

          const gameNumberData: Array<Number> =
            await GetNumberOfGames_NOMETAMASK(card.matchAddress);
          const gameNumber = `${gameNumberData[0]} of ${gameNumberData[1]}`;
          setNumberOfGames(gameNumber);
        }

        setIsChessboardLoading(false);
      } else {
        setIsChessboardLoading(false);
      }
    };
    getGameMoves();
  }, [card]);

  const handleClickApprove = async (
    wagerAddress: string,
    wagerToken: string,
  ) => {
    setIsLoadingApproval(true);
    console.log(wagerToken);

    // await Approve(wagerToken, wagerAmount);
    await AcceptWagerAndApprove(wagerAddress);
    await AcceptWagerConditions(wagerAddress);

    setIsLoadingApproval(false);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Box width="300px" height="300px" position="relative">
        {isChessboardLoading ? (
          <Spinner
            thickness="2px"
            speed="0.85s"
            emptyColor="black"
            color="green.500"
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
        {!card.hasPlayerAccepted &&
          Number(card.player0Address) !== Number(account) && (
            <>
              <Button
                color="#000000" // Set the desired text color
                backgroundColor="#94febf" // Set the desired background color
                variant="solid"
                _hover={{
                  color: '#000000', // Set the text color on hover
                  backgroundColor: '#62ffa2', // Set the background color on hover
                }}
                size="md"
                loadingText="Submitting Transaction"
                onClick={() =>
                  handleClickApprove(card.matchAddress, card.wagerToken)
                }
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Accept Wager
                  {isLoadingApproval && (
                    <div
                      style={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        top: '50%',
                        left: 'calc(100% + 8px)',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      <Spinner
                        thickness="2px"
                        speed="0.85s"
                        emptyColor="gray.800"
                        color="gray.400"
                        size="md"
                      />
                    </div>
                  )}
                </div>
              </Button>
            </>
          )}

        <Link href={`/game/${card.matchAddress}`}>
          <Button
            style={{ width: '250px' }}
            color="#000000" // Set the desired text color
            backgroundColor="#94febf" // Set the desired background color
            variant="solid"
            _hover={{
              color: '#000000', // Set the text color on hover
              backgroundColor: '#62ffa2', // Set the background color on hover
            }}
            size="md"
          >
            Go to Match
          </Button>
        </Link>
      </Stack>
      {!card.hasPlayerAccepted &&
        Number(card.player0Address) !== Number(account) && (
          <Box
            marginTop="50px"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            padding="4"
          >
            <p style={{ marginTop: '10px' }}>
              <strong>
                When accepting a wager, two transactions will occur:
              </strong>
            </p>
            <ul>
              <li>1) Approve Tokens Transaction</li>
              <li>2) Accept Wager Transaction</li>
            </ul>
          </Box>
        )}
    </div>
  );
};

export default SidePanel;
