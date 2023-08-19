'use client';

import {
  GetDividendData,
  GetDividendPayoutData,
  PayoutDividends,
  getChainId,
  getBalance,
  getCrowdSaleBalance,
  getDividendBalances,
  GetChessFishTokens,
} from 'ui/wallet-ui/api/form';

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
} from '@chakra-ui/react';

import AutocompleteToken from './autocomplete-token';
import {
  tokenAddressesByChainID,
  options,
} from '../../ui/wallet-ui/api/autocomplete-token-options';

import React, { useEffect, useState, FC } from 'react';

interface AnalyticsProps {
  useAPI: boolean;
  handleToggle: () => void;
}

interface FormInputs {
  token: string;
}

const Dividends: FC<AnalyticsProps> = ({ useAPI, handleToggle }) => {
  const [dividendAmount, setDividendAmount] = useState<any[]>([]);
  const [totalSupply, setTotalSupply] = useState<any[]>([]);

  const [chainID, setChainID] = useState<string>('1');
  const [tokenOptions, setTokenOptions] = useState<any[]>([]); // default empty array

  // const [tokenDividendBalances, setTokenDividendBalances] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);

  const [loading, setLoading] = useState(true);
  const [formInputs, setFormInputs] = useState<FormInputs>({
    token: '',
  });

  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [receivedTokens, setReceivedTokens] = useState<number>(0);

  const [CFSHbalance, setCFSHBalance] = useState('');

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!useAPI) {
        try {
          const [dividendAmount, totalSupply] = await GetDividendData();
          setDividendAmount(dividendAmount);
          setTotalSupply(totalSupply);

          const balanceCFSH = await getCrowdSaleBalance();
          setCFSHBalance(balanceCFSH);
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          // trying to ping the GCP API
        } catch (error) {
          console.log(error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [useAPI]);

  useEffect(() => {
    // Inner async function to fetch chainID
    const fetchChainId = async () => {
      try {
        const id = String(await getChainId());
        setChainID(id);
        console.log('CHAIN ID', id);
      } catch (error) {
        console.error('Failed to fetch chainID:', error);
      }
    };
    fetchChainId(); // Calling the inner function
  }, []);

  useEffect(() => {
    // This effect will run every time chainID changes
    const tokenOptions = options.map((token) => {
      const addressByChain = tokenAddressesByChainID[chainID];
      return {
        ...token,
        address: addressByChain
          ? addressByChain[token.label]
          : '0x0000000000000000000000000000000000000000', // some default or error address
      };
    });

    setTokenOptions(tokenOptions);
  }, [chainID]); // Dependent on chainID

  useEffect(() => {
    console.log('selected', formInputs);
  }, [formInputs]);

  const handlePayoutDividends = async () => {
    await PayoutDividends(formInputs.token);
  };

  const getCrowdsaleTokens = async (amountIn: string) => {
    console.log(`Getting chessfish tokens`);
    await GetChessFishTokens(amountIn);
  };

  return (
    <ChakraProvider>
      <Text>
        To payout dividends select or paste the address of the token to payout.
      </Text>
      <Flex justifyContent="space-around" padding="5">
        <Stat borderRadius="lg" padding="5">
          <StatLabel color="white">User&apos;s Dividend Amount</StatLabel>
          <StatNumber color="white">{dividendAmount} %</StatNumber>
        </Stat>

        <Stat borderRadius="lg" padding="5">
          <StatLabel color="white">Total Supply</StatLabel>
          <StatNumber color="white">{totalSupply}</StatNumber>
        </Stat>
      </Flex>

      <AutocompleteToken
        options={tokenOptions}
        onChange={(value: string) =>
          setFormInputs((prevInputs) => ({
            ...prevInputs,
            wagerToken: value,
          }))
        }
      />

      <Button onClick={handlePayoutDividends} colorScheme="green" mt={3}>
        Payout Dividends
      </Button>

      {/* Section to get chess fish tokens */}
      <Box
        mt={5}
        borderWidth="1px"
        borderColor="white"
        borderRadius="md"
        padding="3"
      >
        <Text fontWeight="bold">LIMITED TIME CROWDSALE</Text>
        <Text>{CFSHbalance} ChessFish tokens left</Text>
        <Text>1 MATIC = 2 CHFS tokens</Text>
        <VStack spacing={3} alignItems="start">
          <Input
            value={tokenAmount}
            placeholder="Enter matic amount"
            onChange={handleTokenAmountChange}
          />
          <Text>You will receive: {receivedTokens} CHFS tokens</Text>
        </VStack>
        <Button
          colorScheme="green"
          mt={3}
          onClick={() => getCrowdsaleTokens(tokenAmount)}
        >
          Get Tokens
        </Button>
      </Box>
    </ChakraProvider>
  );
};

export default Dividends;
