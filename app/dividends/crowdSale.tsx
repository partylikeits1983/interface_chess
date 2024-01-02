'use-client';

import React, { useState, useEffect } from 'react';

import { getCrowdSaleBalance, GetChessFishTokens } from '#/lib/api/form';

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
  VStack,
  Spinner,
  Link,
} from '@chakra-ui/react';
import alertSuccessFeedback from '#/ui/alertSuccessFeedback';
import { ExternalLinkIcon } from '@chakra-ui/icons';

function CrowdSale() {
  // State Declarations
  const [CFSHbalance, setCFSHBalance] = useState('');
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [receivedTokens, setReceivedTokens] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  // Helper Functions
  const getInitialCountdown = () => {
    const endDate = new Date(2024, 1, 25);
    const currentTime = new Date().getTime();
    const endTime = endDate.getTime();
    return Math.floor((endTime - currentTime) / 1000);
  };

  const [countdownTime, setCountdownTime] = useState(getInitialCountdown());
  const [isLoadingGetTokens, setIsLoadingGetTokens] = useState(false);

  const formatTime = (time: number) => {
    const days = Math.floor(time / (24 * 3600));
    const hours = String(Math.floor((time % (24 * 3600)) / 3600)).padStart(
      2,
      '0',
    );
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return ` ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds `;
  };

  const countdownDisplay = hasMounted
    ? formatTime(countdownTime)
    : 'Loading...';

  // Effects
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTime((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchBalances() {
      const balanceCFSH = await getCrowdSaleBalance();
      setCFSHBalance(balanceCFSH);
      setIsLoading(false);
    }
    fetchBalances();
  }, []);

  // Handlers
  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || /^\d*\.?\d{0,5}$/.test(inputValue)) {
      setTokenAmount(inputValue);
      const valueAsNumber = parseFloat(inputValue) || 0;
      setReceivedTokens(Number((valueAsNumber * (1 / 2.718)).toFixed(5))); // Calculate the number of CFSH tokens
    }
  };

  const getCrowdsaleTokens = async (amountIn: string) => {
    console.log(`Getting chessfish tokens`);
    console.log('HERE', amountIn);
    setIsLoadingGetTokens(true);
    await GetChessFishTokens(amountIn);
    setIsLoadingGetTokens(false);
    alertSuccessFeedback('Success! ChessFish Tokens transfered!');
  };

  // Render
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

    <Text
      textAlign="center"
      fontSize="lg"
      color="green"
      fontFamily="Courier"
    >
      Ends in: {countdownDisplay}
    </Text>
    <Text textAlign="center" fontSize="lg">
      1 CFSH = 2.718 USDC
    </Text>
    <VStack spacing={3} alignItems="center">
      <Text fontSize="md">
        You will receive: {receivedTokens} CFSH tokens
      </Text>
    </VStack>
    <Box width={['95%', '90%', '80%', '60%']} mx="auto">
      <Input
        value={tokenAmount}
        placeholder="Enter USDC amount"
        onChange={handleTokenAmountChange}
      />
      <Button
        colorScheme="green"
        mt={3}
        width="100%"
        onClick={() => getCrowdsaleTokens(tokenAmount)}
      >
        Get Tokens
      </Button>
      {isLoadingGetTokens && (
        <Flex justifyContent="center" alignItems="center" mt={3}>
          <Spinner />
        </Flex>
      )}
      <Flex justifyContent="center" mt={3}>
        <Link
          href="https://sepolia.arbiscan.io/address/0xfc7d5f236428a14a6bd5424331c925285e6336c9"
          isExternal
          color="green.500"
        >
          CrowdSale Contract on Arbiscan
          <ExternalLinkIcon mx="2px" />
        </Link>
      </Flex>
    </Box>
  </Box>
</>


  );
}

export default CrowdSale;
