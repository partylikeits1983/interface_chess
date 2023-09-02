import React, { useState, useEffect } from 'react';

import { GetWagerPlayers, GetWagerStatus } from '#/ui/wallet-ui/api/form';

interface ScoreBoardProps {
  wager: string;
  numberOfGames: string;
}

import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

const ScoreBoard: React.FC<ScoreBoardProps> = ({ wager, numberOfGames }) => {
  const [player0Address, setPlayer0Address] = useState('');
  const [player1Address, setPlayer1Address] = useState('');

  const [winsPlayer0, setWinsPlayer0] = useState(0);
  const [winsPlayer1, setWinsPlayer1] = useState(0);

  useEffect(() => {
    const fetchWins = async () => {
      if (wager) {
        const [_winsPlayer0, _winsPlayer1] = await GetWagerStatus(wager);
        setWinsPlayer0(_winsPlayer0);
        setWinsPlayer1(_winsPlayer1);

        const [_player0Address, _player1Address] = await GetWagerPlayers(wager);
        setPlayer0Address(_player0Address);
        setPlayer1Address(_player1Address);
      }
    };

    fetchWins();
  }, [wager]);

  return (
    <div>
      {wager !== '' && (
        <Table>
          <thead>
            <tr>
              <th>User Address</th>
              <th>Wins</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{player0Address}</td>
              <td>{winsPlayer0}</td>
            </tr>
            <tr>
              <td>{player1Address}</td>
              <td>{winsPlayer1}</td>
            </tr>
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ScoreBoard;
