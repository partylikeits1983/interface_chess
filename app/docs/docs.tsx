'use client';

import React, { useState, useEffect, useRef } from 'react';

import {
  Box,
  Flex,
  ListItem,
  Text,
  Link,
  ChakraProvider,
} from '@chakra-ui/react';

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
      </Flex>
    </ChakraProvider>
  );
}
