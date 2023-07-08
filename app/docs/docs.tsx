'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Flex, Box, Link, Image, Text, ChakraProvider } from '@chakra-ui/react';

import { ChevronRightIcon } from '@chakra-ui/icons';

export default function Docs() {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    setLoaded(true);
  };

  useEffect(() => {
    // Check if image is already loaded when component mounts
    if (imgRef.current?.complete) {
      handleImageLoad();
    }
  }, []); // Run only once after initial render

  const addAlfajoresNetwork = async () => {
    const provider = (window as any).ethereum;

    if (provider) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaef3',
              chainName: 'Alfajores Testnet',
              rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
              nativeCurrency: {
                name: 'Celo',
                symbol: 'A-CELO',
                decimals: 18,
              },
              blockExplorerUrls: ['https://explorer.celo.org/alfajores'],
            },
          ],
        });
      } catch (error) {
        console.error(
          'An error occurred while trying to switch to the Alfajores network:',
          error,
        );
      }
    } else {
      console.log(
        'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
      );
    }
  };

  const addMumbaiNetwork = async () => {
    const provider = (window as any).ethereum;

    if (provider) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x13881',
              chainName: 'Polygon Mumbai',
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              nativeCurrency: {
                name: 'Matic',
                symbol: 'MATIC',
                decimals: 18,
              },
              blockExplorerUrls: ['https://mumbai.polygonscan.com'],
            },
          ],
        });
      } catch (error) {
        console.error(
          'An error occurred while trying to switch to the Polygon Mumbai network:',
          error,
        );
      }
    } else {
      console.log(
        'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
      );
    }
  };

  return (
    <ChakraProvider>
      <Flex flexDirection="column" alignItems="center">
        <Box mb={2}>
          <img
            ref={imgRef}
            src="/chessDark__50.png"
            alt="Placeholder Image"
            width={500}
            height={500}
            onLoad={handleImageLoad}
            style={loaded ? {} : { filter: 'blur(8px)' }}
          />
        </Box>
        <Box style={{ color: 'white' }}>
          Go to{' '}
          <Link
            isExternal
            color="green.500"
            fontWeight="bold"
            onClick={() => {
              window.open('https://docs.chess.fish', '_blank');
            }}
          >
            <i style={{ color: 'green.500' }}>docs.chess.fish</i>
          </Link>
        </Box>
        <Box mt={2}>
          <span style={{ color: 'white' }}>
            to explore the chess.fish documentation
          </span>
        </Box>

        <Flex
          justifyContent="center"
          mt={4}
          flexDirection={'row'}
          align="center"
        >
          <Box
            p={6}
            bgColor="#08131c"
            color="white"
            borderRadius="md"
            cursor="pointer"
            borderColor="white"
            borderWidth={0.5}
            mr={5}
            width="390px" // Set the width to 200 pixels
            _hover={{
              bgColor: 'gray.700',
              borderColor: 'white',
            }}
            onClick={() => {
              addAlfajoresNetwork();
            }}
          >
            <Flex justify="space-between" align="center">
              <Box display="flex" alignItems="center">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  width="24px"
                  height="24px"
                />
                <Text ml={3}>Add Celo Testnet to Metamask</Text>
              </Box>
              <ChevronRightIcon boxSize={6} />
            </Flex>
          </Box>

          <Box
            p={6}
            bgColor="#08131c"
            color="white"
            borderRadius="md"
            cursor="pointer"
            borderColor="white"
            borderWidth={0.5}
            width="250px" // Set the width to 200 pixels
            _hover={{
              bgColor: 'gray.700',
              borderColor: 'white',
            }}
            onClick={() => {
              window.open('https://faucet.celo.org/alfajores', '_blank');
            }}
          >
            <Flex justify="space-between" align="center">
              <Text>Celo Testnet Faucet</Text>
              <ChevronRightIcon boxSize={6} />
            </Flex>
          </Box>
        </Flex>

        <Flex
          justifyContent="center"
          mt={4}
          flexDirection={'row'}
          align="center"
        >
          <Box
            p={6}
            bgColor="#08131c"
            color="white"
            borderRadius="md"
            cursor="pointer"
            borderColor="white"
            borderWidth={0.5}
            width="390px"
            mr={5}
            _hover={{
              bgColor: 'gray.700',
              borderColor: 'white',
            }}
            onClick={() => {
              addMumbaiNetwork();
            }}
          >
            <Flex justify="space-between" align="center">
              <Box display="flex" alignItems="center">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  width="24px"
                  height="24px"
                />
                <Text ml={3}>Add Mumbai Testnet to Metamask</Text>
              </Box>
              <ChevronRightIcon boxSize={6} />
            </Flex>
          </Box>

          <Box
            p={6}
            bgColor="#08131c"
            color="white"
            borderRadius="md"
            cursor="pointer"
            borderColor="white"
            borderWidth={0.5}
            width="250px"
            _hover={{
              bgColor: 'gray.700',
              borderColor: 'white',
            }}
            onClick={() => {
              window.open('https://faucet.polygon.technology/', '_blank');
            }}
          >
            <Flex justify="space-between" align="center">
              <Text>Mumbai Testnet Faucet</Text>
              <ChevronRightIcon boxSize={6} />
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
}
