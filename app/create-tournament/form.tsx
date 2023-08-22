'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  HStack,
  Spinner,
  ChakraProvider,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  Tooltip,
} from '@chakra-ui/react';

import { InfoOutlineIcon } from '@chakra-ui/icons';

const { ethers } = require('ethers');
const {
  CreateTournament,
  ApproveTournament,
  getChainId,
} = require('ui/wallet-ui/api/form');

import {
  tokenAddressesByChainID,
  options,
} from '../../ui/wallet-ui/api/autocomplete-token-options';
import AutocompleteToken from './autocomplete-token';

interface FormInputs {
  numberOfPlayers: number;
  wagerToken: string;
  wagerAmount: number;
  numberOfGames: number;
  timeLimit: number;
}

export default function ChallengeForm() {
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [isLoadingCreateTournament, setIsLoadingCreateTournament] =
    useState(false);

  const [chainID, setChainID] = useState<string>('1');
  const [tokenOptions, setTokenOptions] = useState<any[]>([]); // default empty array

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

  const HandleClickApprove = async () => {
    setIsLoadingApproval(true);
    await ApproveTournament(formInputs.wagerToken, formInputs.wagerAmount);
    setIsLoadingApproval(false);
  };

  const HandleClickCreateTournament = async () => {
    setIsLoadingCreateTournament(true);
    await CreateTournament(formInputs);
    setIsLoadingCreateTournament(false);
  };

  const [formInputs, setFormInputs] = useState<FormInputs>({
    numberOfPlayers: 0,
    wagerToken: '',
    wagerAmount: 0,
    numberOfGames: 0,
    timeLimit: 0,
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
      timeLimit: value,
    }));
    console.log(formInputs);
  };

  const convertSecondsToTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    return `${days} days ${hours} hours ${minutes} minutes`;
  };

  return (
    <ChakraProvider>
      <Box mx="auto">
        <form onSubmit={handleSubmit}>
          <Stack spacing="4">
            <FormControl>
              <FormLabel>
                Tournament Wager Token{' '}
                <Tooltip
                  label="type to search token or paste ERC20 address"
                  aria-label="Player Address Tooltip"
                  placement="right"
                >
                  <Box as={InfoOutlineIcon} ml={0} mb={1.5} />
                </Tooltip>
              </FormLabel>

              <AutocompleteToken
                options={tokenOptions}
                onChange={(value: string) =>
                  setFormInputs((prevInputs) => ({
                    ...prevInputs,
                    wagerToken: value,
                  }))
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>
                Tournament Entry Fee{' '}
                <Tooltip
                  label="The amount required for other players to deposit to enter the tournament"
                  aria-label="Number of games tooltip"
                  placement="right"
                >
                  <Box as={InfoOutlineIcon} ml={0} mb={1.5} />
                </Tooltip>
              </FormLabel>
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
              <FormLabel>
                Number of Players{' '}
                <Tooltip
                  label="Set the maximum number of players in the tournament. Minimum 3 players, maximum 25 players"
                  aria-label="Number of games tooltip"
                  placement="right"
                >
                  <Box as={InfoOutlineIcon} ml={0} mb={1.5} />
                </Tooltip>
              </FormLabel>

              <Input
                type="number"
                name="numberOfPlayers"
                value={formInputs.numberOfPlayers}
                onChange={handleInputChange}
                required
                width="100%"
                min={0}
              />
            </FormControl>

            <FormControl>
              <FormLabel>
                Number of Games Per 1v1 Match{' '}
                <Tooltip
                  label="Number of games must be less than 3"
                  aria-label="Number of games tooltip"
                  placement="right"
                >
                  <Box as={InfoOutlineIcon} ml={0} mb={1.5} />
                </Tooltip>
              </FormLabel>

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
              <FormLabel>
                Tournament Time Limit{' '}
                <Tooltip
                  label="This is the amount of time the tournament will be held"
                  aria-label="Number of games tooltip"
                  placement="right"
                >
                  <Box as={InfoOutlineIcon} ml={0} mb={1.5} />
                </Tooltip>
              </FormLabel>
              <Slider
                min={0}
                max={604800}
                step={1}
                value={formInputs.timeLimit}
                onChange={handleSliderChange}
                defaultValue={formInputs.timeLimit}
              >
                <SliderTrack bg="#e2e8f0">
                  <SliderFilledTrack bg="#94febf" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <p>{convertSecondsToTime(formInputs.timeLimit)}</p>
            </FormControl>

            <HStack spacing="4" direction={{ base: 'column', md: 'row' }}>
              <Button
                flex="1"
                color="#000000"
                backgroundColor="#94febf"
                variant="solid"
                size="lg"
                loadingText="Submitting Transaction"
                onClick={() => HandleClickApprove()}
                _hover={{
                  color: '#000000',
                  backgroundColor: '#62ffa2',
                }}
              >
                Approve Tokens
                <div
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    textAlign: 'center',
                    marginLeft: '8px',
                  }}
                >
                  {isLoadingApproval ? (
                    <Spinner
                      thickness="2px"
                      speed="0.85s"
                      emptyColor="gray.800"
                      color="gray.400"
                      size="md"
                    />
                  ) : null}
                </div>
              </Button>
              <Button
                flex="1"
                color="#000000"
                backgroundColor="#94febf"
                variant="solid"
                size="lg"
                loadingText="Submitting Transaction"
                onClick={() => HandleClickCreateTournament()}
                _hover={{
                  color: '#000000',
                  backgroundColor: '#62ffa2',
                }}
              >
                Create Tournament
                <div
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    textAlign: 'center',
                    marginLeft: '8px',
                  }}
                >
                  {isLoadingCreateTournament ? (
                    <Spinner
                      thickness="2px"
                      speed="0.85s"
                      emptyColor="gray.800"
                      color="gray.400"
                      size="md"
                    />
                  ) : null}
                </div>
              </Button>
            </HStack>
          </Stack>
        </form>
      </Box>
    </ChakraProvider>
  );
}
