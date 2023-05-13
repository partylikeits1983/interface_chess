'use client';

import { GetAnalyticsData } from 'ui/wallet-ui/api/form';
import {
  ChakraProvider,
  Stat,
  StatLabel,
  Box,
  StatNumber,
  StatGroup,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';

export default function Analytics() {
  const [totalGames, setTotalGames] = useState('');
  const [totalWagers, setTotalWagers] = useState('');
  const [wagerAddresses, setWagerAddresses] = useState<string[]>([]); // Specify string[] as the state type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call your async function here to get the total number of games
        const [fetchedWagerAddresses, totalGames] = await GetAnalyticsData();

        setWagerAddresses(fetchedWagerAddresses);
        setTotalGames(totalGames);
        setTotalWagers(fetchedWagerAddresses.length.toString());

        setLoading(false);
      } catch (error) {
        console.error('Error fetching total games:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ChakraProvider>
      <StatGroup color="white">
        <Stat>
          <StatLabel>Total Number of Games Played</StatLabel>
          {loading ? <Spinner /> : <StatNumber>{totalGames}</StatNumber>}
        </Stat>

        <Stat>
          <StatLabel>Current Number of Wagers</StatLabel>
          {loading ? <Spinner /> : <StatNumber>{totalWagers}</StatNumber>}
        </Stat>
      </StatGroup>

      <Box overflowX="auto" maxWidth="100%">
        <Table variant="simple" mt={4} size="sm">
          <Thead>
            <Tr>
              <Th color="white">#</Th>
              <Th color="white">Wager Addresses</Th>
            </Tr>
          </Thead>
          <Tbody>
            {wagerAddresses.map((address, index) => (
              <Tr key={index}>
                <Td color="green.500">{index + 1}</Td>
                <Td>
                  <NextLink href={`/game/${address}`} passHref>
                    <Link color="green.500">{address}</Link>
                  </NextLink>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </ChakraProvider>
  );
}
