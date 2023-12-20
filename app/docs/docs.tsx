'use client';

import React, { useState, useEffect, useRef } from 'react';

import {
  Flex,
  Box,
  Link,
  Image,
  Text,
  Heading,
  ChakraProvider,
  Spinner,
} from '@chakra-ui/react';

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

  const addPolygon = async () => {
    const provider = (window as any).ethereum;

    if (provider) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89',
              chainName: 'Polygon Mumbai',
              rpcUrls: ['https://polygon.llamarpc.com'],
              nativeCurrency: {
                name: 'Matic',
                symbol: 'MATIC',
                decimals: 18,
              },
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
          ],
        });
      } catch (error) {
        console.error(
          'An error occurred while trying to switch to the Polygon network:',
          error,
        );
      }
    } else {
      console.log(
        'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
      );
    }
  };

  const addArbitrumSepolia = async () => {
    const provider = (window as any).ethereum;

    if (provider) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x66eed',
              chainName: 'Arbitrum addArbitrumSepolia',
              rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
              nativeCurrency: {
                name: 'AGOR',
                symbol: 'AGOR',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.arbiscan.io'],
            },
          ],
        });
      } catch (error) {
        console.error(
          'An error occurred while trying to switch to the Arbitrum Sepolia network:',
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
        <Box mb={2} position="relative" width="500px" height="500px">
          {!loaded && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            >
              <Spinner />
            </Box>
          )}
          <img
            ref={imgRef}
            src="/chessDark__50.png"
            alt="Placeholder Image"
            width={500}
            height={500}
            onLoad={handleImageLoad}
            style={loaded ? {} : { display: 'none' }}
          />
        </Box>
        <Box style={{ color: 'white' }}>
          Read the{' '}
          <Link
            isExternal
            color="green.500"
            fontWeight="bold"
            onClick={() => {
              window.open('https://docs.chess.fish/', '_blank');
            }}
          >
            <i style={{ color: 'green.500' }}>Chess.fish documentation</i>
          </Link>{' '}
          to learn more
        </Box>

        <div style={{ height: '20px' }}></div>

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
              addPolygon();
            }}
          >
            <Flex justify="space-between" align="center">
              <Box display="flex" alignItems="center">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  width="24px"
                  height="24px"
                />
                <Text ml={3}>Add Arbitrum to Metamask</Text>
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
              window.open('https://arbiscan.io/', '_blank');
            }}
          >
            <Flex justify="space-between" align="center">
              <Text>Arbitrum Block explorer</Text>
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
              addArbitrumSepolia();
            }}
          >
            <Flex justify="space-between" align="center">
              <Box display="flex" alignItems="center">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  width="24px"
                  height="24px"
                />
                <Text ml={3}>Add Arbitrum Sepolia Testnet to Metamask</Text>
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
              window.open('https://sepolia.arbiscan.io/', '_blank');
            }}
          >
            <Flex justify="space-between" align="center">
              <Text>Arbitrum Sepolia Explorer</Text>
              <ChevronRightIcon boxSize={6} />
            </Flex>
          </Box>
        </Flex>

        <div style={{ height: '20px' }}></div>

        <Box style={{ color: 'white' }}>
          Don&apos;t have metamask yet?{' '}
          <Link
            isExternal
            color="green.500"
            // fontWeight="bold"
            onClick={() => {
              window.open(
                'https://support.metamask.io/hc/en-us/articles/360015489531-Getting-started-with-MetaMask',
                '_blank',
              );
            }}
          >
            <i style={{ color: 'green.500' }}>
              Read Getting Started With Metamask
            </i>
          </Link>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}
