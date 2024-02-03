import React, { useState, useEffect } from 'react';
import {
  GetWagerPlayers,
  GetWagerStatus,
  setupProvider,
  IsPlayer0White,
} from '#/lib/api/form';

import { GetLastOnline } from '#/lib/api/db-api';
import { convertAddressToUsername } from 'eth-username-generator';

import { Table, Td, Tr, Th, Thead, Tbody, Link , Box} from '@chakra-ui/react';

interface ScoreBoardProps {
  wager: string;
  numberOfGames: string;
  gameNumber: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ wager, gameNumber }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [player0Address, setPlayer0Address] = useState('');
  const [player1Address, setPlayer1Address] = useState('');
  const [winsPlayer0, setWinsPlayer0] = useState(0);
  const [winsPlayer1, setWinsPlayer1] = useState(0);
  const [isPlayer0White, setIsPlayer0White] = useState(false);

  const [timeLastOnlinePlayer0, setTimeLastOnlinePlayer0] = useState('');
  const [timeLastOnlinePlayer1, setTimeLastOnlinePlayer1] = useState('');

  function lastOnline(utcTimestamp: string): string {
    if (utcTimestamp === "null") {
      return "long ago";
    }
  

    // Parse the provided UTC timestamp as a Date object
    const timestampDate = new Date(utcTimestamp);
    
    // Get the current date/time as a Date object
    const now = new Date();
    
    // Calculate the difference in milliseconds and ensure it's treated as a number
    const differenceInMilliseconds = now.getTime() - timestampDate.getTime();
    
    // Convert milliseconds to minutes
    const minutesAgo = Math.floor(differenceInMilliseconds / 60000);
    
    // Check if the time difference is less than 10 minutes
    if (minutesAgo < 10) {
      return "Online";
    }

    
    
    // Check if the time difference is more than 24 hours
    else if (minutesAgo > 1440) { // 1440 minutes in a day
      const daysAgo = Math.floor(minutesAgo / 1440);
      return daysAgo + (daysAgo === 1 ? " day ago" : " days ago");
    }
    
    // Otherwise, return the time in minutes
    else {
      return minutesAgo + (minutesAgo === 1 ? " minute ago" : " minutes ago");
    }
  }


  useEffect(() => {
    const fetchWins = async () => {
      let { isWalletConnected } = await setupProvider();
      setIsWalletConnected(isWalletConnected);

      if (wager && isWalletConnected === true) {
        const [_winsPlayer0, _winsPlayer1] = await GetWagerStatus(wager);
        setWinsPlayer0(_winsPlayer0);
        setWinsPlayer1(_winsPlayer1);

        const [_player0Address, _player1Address] = await GetWagerPlayers(wager);
        setPlayer0Address(_player0Address);
        setPlayer1Address(_player1Address);

        const _isPlayer0White = await IsPlayer0White(wager);
        setIsPlayer0White(_isPlayer0White);

        const _timeLastOnline0 = await GetLastOnline(_player0Address);
        const _timeLastOnline1 = await GetLastOnline(_player1Address);

        console.log("TIME LAST ON LINE", _timeLastOnline0, _timeLastOnline1);

        setTimeLastOnlinePlayer0(lastOnline(_timeLastOnline0));
        setTimeLastOnlinePlayer1(lastOnline(_timeLastOnline1));
      }
    };

    fetchWins();
  }, [wager, gameNumber]);

  return (
    <Box border="0.1px solid" borderColor="black" p={0}>

    <div style={{ overflowX: 'hidden' }}>
      {wager !== '' && (


        <Table variant="simple">
          <Thead>
            <Tr>
              <Th style={{ color: 'white' }}>Color</Th>
              <Th style={{ color: 'white' }}>Player</Th>
              <Th style={{ color: 'white' }}>Wins</Th>
              <Th style={{ color: 'white' }}>Last Online</Th> {/* New Header */}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>White</Td>
              <Td>
                <Link
                  href={`https://arbiscan.io/address/${isPlayer0White ? player1Address : player0Address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="#42ff72"
                >
                  {convertAddressToUsername(isPlayer0White ? player1Address : player0Address)}
                </Link>
              </Td>
              <Td>{isPlayer0White ? winsPlayer1 : winsPlayer0}</Td>
              <Td>{isPlayer0White ? timeLastOnlinePlayer1 : timeLastOnlinePlayer0}</Td> {/* Display Last Online */}
            </Tr>
            <Tr>
              <Td>Black</Td>
              <Td>
                <Link
                  href={`https://arbiscan.io/address/${isPlayer0White ? player0Address : player1Address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="#42ff72"
                >
                  {convertAddressToUsername(isPlayer0White ? player0Address : player1Address)}
                </Link>
              </Td>
              <Td>{isPlayer0White ? winsPlayer0 : winsPlayer1}</Td>
              <Td>{isPlayer0White ? timeLastOnlinePlayer0 : timeLastOnlinePlayer1}</Td> {/* Display Last Online */}
            </Tr>
          </Tbody>
        </Table>
      )}
    </div>
    </Box>

  );
};

export default ScoreBoard;
