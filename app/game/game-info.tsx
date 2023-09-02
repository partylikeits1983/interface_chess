import React, { useState, useEffect } from 'react';

import { getTokenDetails } from '#/ui/wallet-ui/api/token-information';
import { useStateManager } from 'ui/wallet-ui/api/sharedState';

interface GameInfoProps {
  wager: string;
  wagerToken: string;
  wagerAmount: string;
  numberOfGames: string;
  timeLimit: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayerTurn: boolean;
  isPlayer0White: boolean;
}

import { Table } from '@chakra-ui/react';
import { globalAgent } from 'http';

type TokenDetail = {
  label: string;
  image: string;
};

const GameInfo: React.FC<GameInfoProps> = ({
  wager,
  wagerToken,
  wagerAmount,
  numberOfGames,
  timeLimit,
  isPlayerTurn,
}) => {
  const [globalState, setGlobalState] = useStateManager();

  const [tokenDetail, setTokenDetail] = useState<TokenDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getScoreData() {
      setIsLoading(true);
      const detail = getTokenDetails(globalState.chainID, wagerToken);
      setTokenDetail(detail);

      console.log('HERE');
      console.log(detail);

      setIsLoading(false);
    }
    getScoreData();
  }, []);

  function formatSecondsToTime(secondsString: string): string {
    const seconds = parseInt(secondsString, 10);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${padZero(hours)} hours ${padZero(
      minutes,
    )} minutes ${padZero(remainingSeconds)} seconds`;
    return formattedTime;
  }

  function padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  return (
    <div>
      {wager !== '' && (
        <div>
          <Table size="xl">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Time Limit</th>
                <th>Game</th>
                <th>Your Turn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{wagerAmount} DAI</td>
                <td>{formatSecondsToTime(timeLimit.toString())}</td>
                <td>{numberOfGames}</td>
                <td>{isPlayerTurn ? 'True' : 'False'}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
