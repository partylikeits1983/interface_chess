'use client';
import { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  ChakraProvider,
} from '@chakra-ui/react';

const { ethers } = require('ethers');
const { CreateWager } = require('ui/wallet-ui/api/form');

interface FormInputs {
  playerAddress: string;
  wagerToken: string;
  wagerAmount: number;
  timePerMove: number;
  numberOfGames: number;
}

export default function ChallengeForm() {
  const [formInputs, setFormInputs] = useState<FormInputs>({
    playerAddress: '',
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

  const submitWager = async (formInputs: FormInputs): Promise<boolean> => {
    console.log('submit wager func');
    console.log(formInputs);

    await CreateWager(formInputs);
    return true;
  };

  return (
    <ChakraProvider>
      <Box mx="auto">
        <form onSubmit={handleSubmit}>
          <Stack spacing="6">
            <FormControl>
              <FormLabel>Player Address</FormLabel>
              <Input
                type="text"
                name="playerAddress"
                value={formInputs.playerAddress}
                onChange={handleInputChange}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>Wager Token</FormLabel>
              <Input
                type="text"
                name="wagerToken"
                value={formInputs.wagerToken}
                onChange={handleInputChange}
                required
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
              />
            </FormControl>
            <FormControl>
              <FormLabel>Time Per Move</FormLabel>
              <Input
                type="number"
                name="timePerMove"
                value={formInputs.timePerMove}
                onChange={handleInputChange}
                required
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
              />
            </FormControl>
            <Button
              colorScheme="teal"
              variant="outline"
              isLoading={false}
              loadingText="Submitting Transaction"
              onClick={() => submitWager(formInputs)}
            >
              Create Challenge
            </Button>
          </Stack>
        </form>
      </Box>
    </ChakraProvider>
  );
}
