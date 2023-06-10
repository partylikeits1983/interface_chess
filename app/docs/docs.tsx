'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Flex, Box, Link, ChakraProvider } from '@chakra-ui/react';

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
            href="https://docs.chess.fish"
            isExternal
            color="green.500"
            fontWeight="bold"
          >
            <a href="https://docs.chess.fish" style={{ color: 'green.500' }}>
              docs.chess.fish
            </a>
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
            bgColor="black"
            color="white"
            borderRadius="md"
            cursor="pointer"
            _hover={{
              bgColor: 'gray.800',
              borderColor: 'white',
            }}
            onClick={() => {
              addAlfajoresNetwork();
            }}
          >
            Add Celo Testnet to Metamask
          </Box>
          <Box
            p={6}
            bgColor="black"
            color="white"
            borderRadius="md"
            cursor="pointer"
            _hover={{
              bgColor: 'gray.800',
              borderColor: 'white',
            }}
            onClick={() => {
              // Handle click event for the second box
            }}
          >
            Celo Testnet Faucet
          </Box>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
}
