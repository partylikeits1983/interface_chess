'use-client';

import React, { useState, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

import { getCrowdSaleBalance, GetChessFishTokens, getCrowdSaleBalance_NOMETAMASK } from '#/lib/api/form';

import {
  Flex,
  Text,
  Button,
  Box,
  Input,
  VStack,
  Spinner,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { checkMetaMaskConnection } from '#/lib/api/sharedState';

function CrowdSale() {
  // State Declarations
  const tokensForSale = 300000;

  const [CFSHbalance, setCFSHBalance] = useState('');
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const [receivedTokens, setReceivedTokens] = useState<number>(0);
  const tokensSold = useMemo(() => {
    const soldIncludingInput =
      tokensForSale - Number(CFSHbalance) + Number(receivedTokens);
    return soldIncludingInput > tokensForSale
      ? tokensForSale
      : soldIncludingInput;
  }, [CFSHbalance, receivedTokens]);

  const remainingTokens = useMemo(() => {
    return tokensForSale - tokensSold;
  }, [tokensSold]);
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
      const hasMetamask = await checkMetaMaskConnection();
      let balanceCFSH; 
      if (hasMetamask) {
      balanceCFSH = await getCrowdSaleBalance();
      } else {
balanceCFSH = await getCrowdSaleBalance_NOMETAMASK();
      }
      setCFSHBalance(balanceCFSH);
     setIsLoading(false);
    }
    fetchBalances();
  }, []);

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

        {/* Display CFSH Balance and Pie Chart */}
        <VStack spacing={3} alignItems="center">
          <Text fontSize="md" fontWeight="bold">
            CFSH Tokens Remaining: {CFSHbalance}
          </Text>

          {/* Pie Chart in a Smaller Container */}
          <Box width="50%" height="50%" style={{ marginBottom: '24px' }}>
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" height="100%">
                <Spinner /> {/* Display Spinner while loading */}
              </Flex>
            ) : (
              <Pie
                data={{
                  labels: ['Remaining', 'Sold'],
                  datasets: [
                    {
                      data: [remainingTokens, tokensSold],
                      backgroundColor: ['#008000', '#000000'], // Green for remaining, Black for sold
                      hoverBackgroundColor: ['#008000', '#000000'],
                    },
                  ],
                }}
              />
            )}
          </Box>
        </VStack>

        {/* End of Display CFSH Balance and Pie Chart */}

        <Box width={['95%', '90%', '80%', '60%']} mx="auto" textAlign="center">
          {' '}
          {/* Center align the text */}
          <Input
            value={tokenAmount}
            placeholder="Enter USDC amount"
            onChange={handleTokenAmountChange}
          />
          <Text fontSize="md" mt={3}>
            {' '}
            {/* Add margin top for spacing and center alignment */}
            You will receive: {receivedTokens} CFSH tokens
          </Text>
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
              href="https://arbiscan.io/address/0xE2976A66E8CEF3932CDAEb935E114dCd5ce20F20"
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
