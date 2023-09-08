import React, { FC, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Card } from '../types';
import { Button, Stack, Box, Spinner } from '@chakra-ui/react';

import { Chess } from 'chess.js';
import alertSuccessFeedback from '#/ui/alertSuccessFeedback';

const {
  GetGameMoves,
  GetNumberOfGames,
  IsPlayerWhite,
  PayoutWager,
  CancelWager,
  AcceptWagerAndApprove,
  AcceptWagerConditions,
  IsWagerGameTimeEnded,
  UpdateWagerStateTime,
} = require('ui/wallet-ui/api/form');

interface CardSidePanelProps {
  card: Card; // Your Card type here
  isPendingApproval: boolean;
}

const SidePanel: FC<CardSidePanelProps> = ({ card, isPendingApproval }) => {
  const {
    matchAddress,
    player0Address,
    player1Address,
    wagerToken,
    isInProgress,
    isComplete,
  } = card;
  const [isChessboardLoading, setIsChessboardLoading] = useState(false);

  const [game, setGame] = useState(new Chess());

  const [isPlayerWhite, setPlayerColor] = useState('white');
  const [numberOfGames, setNumberOfGames] = useState('');

  const [isLoadingGoToMatch, setLoadingGoToMatch] = useState(false);

  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [isLoadingCancelWager, setLoadingCancelWager] = useState(false);
  const [isLoadingPayoutWager, setLoadingPayoutWager] = useState(false);
  const [isLoadingUpdateTime, setIsLoadingUpdateTime] = useState(false);

  const [isTimeEnded, setIsTimeEnded] = useState(false);
  const [isTournament, setIsTournament] = useState(false);

  const router = useRouter();

  const handleGoToMatch = (matchAddress: string) => {
    setLoadingGoToMatch(true);
    router.push(`/game/${matchAddress}`);
  };

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
          game.move(movesArray[i]);
        }
        setGame(game);

        const isPlayerWhite = await IsPlayerWhite(card.matchAddress);
        setPlayerColor(isPlayerWhite);

        const isTimeEnded = await IsWagerGameTimeEnded(card.matchAddress);
        setIsTimeEnded(isTimeEnded);

        setIsTournament(card.isTournament);

        setIsChessboardLoading(false);
      } else {
        setIsChessboardLoading(false);
      }
    };
    getGameMoves();
  }, [card]);

  const handleSubmitPayoutWager = async () => {
    try {
      setLoadingPayoutWager(true);
      console.log(matchAddress);
      await PayoutWager(matchAddress);
      setLoadingPayoutWager(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickApproveWager = async (
    wagerAddress: string,
    wagerToken: string,
  ) => {
    setIsLoadingApproval(true);

    await AcceptWagerAndApprove(wagerAddress);
    await AcceptWagerConditions(wagerAddress);

    alertSuccessFeedback('Wager Accepted!');

    setIsLoadingApproval(false);
  };

  const handleSubmitCancelWager = async () => {
    try {
      setLoadingCancelWager(true);
      await CancelWager(matchAddress);

      setLoadingCancelWager(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickUpdateTimeWager = async (wagerAddress: string) => {
    setIsLoadingUpdateTime(true);
    console.log(wagerToken);

    await UpdateWagerStateTime(wagerAddress);

    // alertSuccessFeedback('Wager State Updated!');

    setIsLoadingUpdateTime(false);
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
        {isPendingApproval && (
          <Button
            style={{ width: '250px', position: 'relative' }}
            variant="outline"
            color="#fffff" // Set the desired text color
            _hover={{
              color: '#000000', // Set the text color on hover
              backgroundColor: '#62ffa2', // Set the background color on hover
            }}
            loadingText="Submitting Transaction"
            onClick={() =>
              handleClickApproveWager(card.matchAddress, card.wagerToken)
            }
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Accept Wager Conditions
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
        )}

        <Link href={`/game/${card.matchAddress}`}>
          <Button
            style={{ width: '250px', position: 'relative' }}
            variant="outline"
            color="#fffff" // Set the desired text color
            _hover={{
              color: '#000000', // Set the text color on hover
              backgroundColor: '#62ffa2', // Set the background color on hover
            }}
            loadingText="Loading"
            onClick={() => handleGoToMatch(card.matchAddress)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Go to Match
              {isLoadingGoToMatch && (
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
        </Link>

        {!isInProgress && !isTournament && (
          <>
            <Button
              style={{ width: '250px', position: 'relative' }}
              variant="outline"
              color="#fffff" // Set the desired text color
              _hover={{
                color: '#000000', // Set the text color on hover
                backgroundColor: '#62ffa2', // Set the background color on hover
              }}
              loadingText="Submitting Transaction"
              onClick={() => handleSubmitCancelWager()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Cancel Wager
                {isLoadingCancelWager && (
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

        {!isPendingApproval && isInProgress && !isTournament && (
          <>
            <Button
              style={{ width: '250px', position: 'relative' }}
              variant="outline"
              color="#fffff" // Set the desired text color
              _hover={{
                color: '#000000', // Set the text color on hover
                backgroundColor: '#62ffa2', // Set the background color on hover
              }}
              loadingText="Submitting Transaction"
              onClick={() => handleSubmitPayoutWager()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Payout Wager
                {isLoadingPayoutWager && (
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

        {IsWagerGameTimeEnded && isInProgress && !isComplete && (
          <>
            <Button
              style={{ width: '250px', position: 'relative' }}
              variant="outline"
              color="#fffff" // Set the desired text color
              _hover={{
                color: '#000000', // Set the text color on hover
                backgroundColor: '#62ffa2', // Set the background color on hover
              }}
              loadingText="Submitting Transaction"
              onClick={() => handleClickUpdateTimeWager(card.matchAddress)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Claim Win On Time
                {isLoadingUpdateTime && (
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
      </Stack>
      {isPendingApproval && (
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
