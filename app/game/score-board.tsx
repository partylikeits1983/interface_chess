import React, { useState, useEffect } from 'react';

import { GetWagerPlayers, GetWagerStatus } from '#/ui/wallet-ui/api/form';

interface ScoreBoardProps {
  wager: string;
  addressPlayer0: string;
  addressPlayer1: string;
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

        console.log('INSIDE OF COMPONENT');
        console.log(_winsPlayer0, _winsPlayer1);
      }
    };

    fetchWins();
  }, [wager]);

  return (
    <div>
      {wager !== '' && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          fontSize="md"
          mt={4}
        >
          <Table>
            <Thead>
              <Tr>
                <Th>User Address</Th>
                <Th>Wins</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{player0Address}</Td>
                <Td>{winsPlayer0}</Td>
              </Tr>
              <Tr>
                <Td>{player1Address}</Td>
                <Td>{winsPlayer1}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      )}
    </div>
  );
};

export default ScoreBoard;
