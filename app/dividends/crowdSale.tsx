import React, { useState, useEffect } from 'react';

import { getCrowdSaleBalance, GetChessFishTokens } from 'ui/wallet-ui/api/form';

import {
  ChakraProvider,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Text,
  Button,
  Box,
  Input,
  Link,
  VStack,
} from '@chakra-ui/react';

function CrowdSale() {
  const [CFSHbalance, setCFSHBalance] = useState('');
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [receivedTokens, setReceivedTokens] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  const getInitialCountdown = () => {
    const endDate = new Date(new Date().getFullYear(), 9, 8); // Month is 0-indexed, so 9 is October
    const currentTime = new Date().getTime();
    const endTime = endDate.getTime();

    // Calculate the difference in seconds
    return Math.floor((endTime - currentTime) / 1000);
  };

  const [countdownTime, setCountdownTime] = useState(getInitialCountdown());

  useEffect(() => {
    // Countdown logic
    const timer = setInterval(() => {
      setCountdownTime((prevTime) => prevTime - 1);
    }, 1000);

    // Clear interval when component unmounts
    return () => clearInterval(timer);
  }, []);

  // Convert time in seconds to Days, HH:MM:SS format
  const formatTime = (time: number) => {
    const days = Math.floor(time / (24 * 3600));
    const hours = Math.floor((time % (24 * 3600)) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${days}d ${hours}:${minutes < 10 ? '0' + minutes : minutes}:${
      seconds < 10 ? '0' + seconds : seconds
    }`;
  };

  useEffect(() => {
    async function fetchBalances() {
      const balanceCFSH = await getCrowdSaleBalance();
      setCFSHBalance(balanceCFSH);
      setIsLoading(false); // Set loading state to false once balances are fetched
    }

    fetchBalances();
  }, []);

  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Modified regex to handle one decimal point, starting with a dot, and up to two decimals
    if (inputValue === '' || /^\d*\.?\d{0,5}$/.test(inputValue)) {
      setTokenAmount(inputValue);

      // Convert to number and handle potential NaN scenario
      const valueAsNumber = parseFloat(inputValue) || 0;
      setReceivedTokens(Number((valueAsNumber * 2).toFixed(5)));
    }
  };

  const getCrowdsaleTokens = async (amountIn: string) => {
    console.log(`Getting chessfish tokens`);
    await GetChessFishTokens(amountIn);
  };

  return (
    <>
      <Box
        mt={5}
        borderWidth="1px"
        borderColor="white"
        borderRadius="md"
        padding="3"
      >
        <Text textAlign="center" fontWeight="bold" fontSize="xl">
          LIMITED TIME CROWDSALE
        </Text>
        <Text textAlign="center" fontSize="lg">
          Ends in: {formatTime(countdownTime)}
        </Text>{' '}
        <Text textAlign="center" fontSize="lg">
          {CFSHbalance} ChessFish tokens left
        </Text>
        <Text textAlign="center" fontSize="lg">
          1 MATIC = 2 CHFS tokens
        </Text>
        <VStack spacing={3} alignItems="center">
          <Text fontSize="md">
            You will receive: {receivedTokens} CHFS tokens
          </Text>
        </VStack>
        {/* Container for Input and Button */}
        <Box width={['95%', '90%', '80%', '60%']} mx="auto">
          <Input
            value={tokenAmount}
            placeholder="Enter matic amount"
            onChange={handleTokenAmountChange}
          />
          <Button
            colorScheme="green"
            mt={3}
            width="100%" // makes the button stretch the width of the parent
            onClick={() => getCrowdsaleTokens(tokenAmount)}
          >
            Get Tokens
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default CrowdSale;
