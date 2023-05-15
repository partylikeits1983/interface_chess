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
  VStack,
  ChakraProvider,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';

import Select from 'react-select';

const { ethers } = require('ethers');
const { CreateWager, Approve } = require('ui/wallet-ui/api/form');

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
      value: 'chocolate',
      label: (
        <div>
          <img src="favicon.ico" height="30px" width="30px" />
          Chocolate{' '}
        </div>
      ),
    },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];

  return (
    <ChakraProvider>
      <Box mx="auto">
        <form onSubmit={handleSubmit}>
          <Stack spacing="4">
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
              <Select options={options} isSearchable />
            </FormControl>

            <FormControl>
              <FormLabel>Wager Token</FormLabel>
              <Input
                type="text"
                name="wagerToken"
                value={formInputs.wagerToken}
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
