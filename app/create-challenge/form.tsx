'use client';
import { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  HStack,
  Avatar,
  ChakraProvider,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  Select,
} from '@chakra-ui/react';

const { ethers } = require('ethers');
const { CreateWager, Approve } = require('ui/wallet-ui/api/form');

import Autocomplete from './autocomplete';

interface FormInputs {
  player1: string;
  wagerToken: string;
  wagerAmount: number;
  timePerMove: number;
  numberOfGames: number;
}

export default function ChallengeForm() {
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [isLoadingCreateWager, setIsLoadingCreateWager] = useState(false);

  const HandleClickApprove = async () => {
    setIsLoadingApproval(true);
    await Approve(formInputs.wagerToken, formInputs.wagerAmount);
    setIsLoadingApproval(false);
  };

  const HandleClickCreateWager = async () => {
    setIsLoadingCreateWager(true);
    await CreateWager(formInputs);
    setIsLoadingCreateWager(false);
  };

  const [formInputs, setFormInputs] = useState<FormInputs>({
    player1: '',
    wagerToken: '',
    wagerAmount: 0,
    timePerMove: 0,
    numberOfGames: 0,
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value } = event.target;
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
    console.log(formInputs);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    console.log(formInputs);
  };

  const handleSliderChange = (value: number) => {
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      timePerMove: value,
    }));
  };

  const convertSecondsToTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    return `${days} days ${hours} hours ${minutes} minutes`;
  };

  const options = [
    {
      label: 'WBTC',
      image:
        'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/logo.png',
      address: '0x123',
    },
    {
      label: 'WETH',
      image:
        'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png',
      address: '0x123',
    },
    {
      label: 'USDT',
      image:
        'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7/logo.png',
      address: '0x123',
    },
    {
      label: 'USDC',
      image:
        'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png',
      address: '0x123',
    },
    {
      label: 'DAI',
      image:
        'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f/logo.png',
      address: '0x123',
    },
  ];

  return (
    <ChakraProvider>
      <Box mx="auto">
        <form onSubmit={handleSubmit}>
          <Stack spacing="4">
            <FormControl>
              <FormLabel>Wager Token</FormLabel>
              <Autocomplete
                options={options}
                onChange={(value: string) =>
                  setFormInputs((prevInputs) => ({
                    ...prevInputs,
                    wagerToken: value,
                  }))
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Player Address</FormLabel>
              <Input
                type="text"
                name="player1"
                value={formInputs.player1}
                onChange={handleInputChange}
                required
                width="100%"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Wager Amount</FormLabel>
              <Input
                type="number"
                name="wagerAmount"
                value={formInputs.wagerAmount}
                onChange={handleInputChange}
                required
                width="100%"
                min={0}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Number of Games</FormLabel>
              <Input
                type="number"
                name="numberOfGames"
                value={formInputs.numberOfGames}
                onChange={handleInputChange}
                required
                width="100%"
                min={0}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Time Limit</FormLabel>
              <Slider
                min={0}
                max={604800}
                step={1}
                value={formInputs.timePerMove}
                onChange={handleSliderChange}
                defaultValue={formInputs.timePerMove}
              >
                <SliderTrack bg="#e2e8f0">
                  <SliderFilledTrack bg="#94febf" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <p>{convertSecondsToTime(formInputs.timePerMove)}</p>
            </FormControl>

            <HStack spacing="4">
              <Button
                flex="1"
                color="#000000" // Set the desired text color
                backgroundColor="#94febf" // Set the desired background color
                variant="solid"
                size="lg"
                isLoading={isLoadingApproval}
                loadingText="Submitting Transaction"
                onClick={() => HandleClickApprove()}
                _hover={{
                  color: '#000000', // Set the text color on hover
                  backgroundColor: '#62ffa2', // Set the background color on hover
                }}
              >
                Approve Tokens
              </Button>
              <Button
                flex="1"
                color="#000000" // Set the desired text color
                backgroundColor="#94febf" // Set the desired background color
                variant="solid"
                size="lg"
                isLoading={isLoadingCreateWager}
                loadingText="Submitting Transaction"
                onClick={() => HandleClickCreateWager()}
                _hover={{
                  color: '#000000', // Set the text color on hover
                  backgroundColor: '#62ffa2', // Set the background color on hover
                }}
              >
                Create Wager
              </Button>
            </HStack>
          </Stack>
        </form>
      </Box>
    </ChakraProvider>
  );
}
