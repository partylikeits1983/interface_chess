'use client';

import {
  GetDividendData,
  GetDividendPayoutData,
  PayoutDividends,
} from 'ui/wallet-ui/api/form';
import { GetWagersDB } from 'ui/wallet-ui/api/db-api';

import {
  ChakraProvider,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
} from '@chakra-ui/react';

import AutocompleteToken from './autocomplete-token';
import tokenOptions from '../create-challenge/autocomplete-token-options';

import { QuestionOutlineIcon } from '@chakra-ui/icons';
import React, { useEffect, useState, FC } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!useAPI) {
        try {
          const [dividendAmount, totalSupply] = await GetDividendData();

          setDividendAmount(dividendAmount);
          setTotalSupply(totalSupply);
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          // trying to ping the GCP API
          // const wagerAddresses = await GetWagersDB();
        } catch (error) {
          console.log(error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [useAPI]);

  const [formInputs, setFormInputs] = useState<FormInputs>({
    token: '',
  });

  return (
    <ChakraProvider>
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
    </ChakraProvider>
  );
};

export default Dividends;
