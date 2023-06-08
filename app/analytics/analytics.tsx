'use client';

import { GetAnalyticsData } from 'ui/wallet-ui/api/form';
import { GetWagersDB } from 'ui/wallet-ui/api/db-api';

import {
  ChakraProvider,
  Stat,
  StatLabel,
  Box,
  StatNumber,
  StatGroup,
  Spinner,
  IconButton,
  Table,
  Flex,
  Switch,
  Tooltip,
  Tr,
  Th,
  Td,
  Link,
} from '@chakra-ui/react';

import { QuestionOutlineIcon } from '@chakra-ui/icons';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export default function Analytics() {
  const [totalGames, setTotalGames] = useState('');
  const [totalWagers, setTotalWagers] = useState('');
  const [wagerAddresses, setWagerAddresses] = useState<string[]>([]); // Specify string[] as the state type
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const [useAPI, setUseAPI] = useState(false);

  const handleToggle = () => {
    setUseAPI(!useAPI);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // trying to ping the GCP API
        const wagerAddresses = await GetWagersDB();

        setWagerAddresses(wagerAddresses);
        setTotalGames(wagerAddresses.length.toString());
        setTotalWagers(wagerAddresses.length.toString());

        setLoading(false);
      } catch (error) {
        try {
          // if GCP api is down, calling contract directly (slower)
          const [fetchedWagerAddresses, totalGames] = await GetAnalyticsData();

          setWagerAddresses(fetchedWagerAddresses);
          setTotalGames(totalGames);
          setTotalWagers(fetchedWagerAddresses.length.toString());

          setLoading(false);
        } catch (error) {
          console.log(error);
        }

        console.error('Error fetching total games:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (useAPI) {
        try {
          const [fetchedWagerAddresses, totalGames] = await GetAnalyticsData();

          setWagerAddresses(fetchedWagerAddresses);
          setTotalGames(totalGames);
          setTotalWagers(fetchedWagerAddresses.length.toString());

          setLoading(false);
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          // trying to ping the GCP API
          const wagerAddresses = await GetWagersDB();

          setWagerAddresses(wagerAddresses);
          setTotalGames(wagerAddresses.length.toString());
          setTotalWagers(wagerAddresses.length.toString());

          setLoading(false);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <ChakraProvider>
      <Flex justify="flex-end" pr={4} pt={0} alignItems="center">
        <Switch
          colorScheme="green"
          isChecked={useAPI}
          onChange={handleToggle}
        />

        <Tooltip label="When on, get values from on chain" hasArrow>
          <QuestionOutlineIcon color="white" ml={2} />
        </Tooltip>
      </Flex>

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
          <thead>
            <Tr>
              <Th color="white">#</Th>
              <Th color="white">Wager Addresses</Th>
            </Tr>
          </thead>
          <tbody>
            {wagerAddresses.map((address, index) => (
              <Tr key={index}>
                <Td color="green.400">{index + 1}</Td>
                <Td>
                  <Link
                    color="green.400"
                    onClick={() => router.push(`/game/${address}`)}
                  >
                    {address}
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </ChakraProvider>
  );
}
