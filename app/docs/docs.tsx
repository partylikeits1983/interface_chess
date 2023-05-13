'use client';

import {
  Box,
  Flex,
  ListItem,
  Text,
  Link,
  ChakraProvider,
} from '@chakra-ui/react';

export default function Docs() {
  return (
    <ChakraProvider>
      <Flex flexDirection="column" alignItems="center">
        <Box mb={2}>
          <img
            src="/chessDark__50.png"
            alt="Placeholder Image"
            width={500}
            height={500}
          />
        </Box>
        <Link
          href="https://docs.chess.fish"
          isExternal
          color="white"
          fontWeight="bold"
        >
          Go to <strong style={{ color: 'white' }}>docs.chess.fish</strong>
        </Link>
        <Box mt={2}>
          <span style={{ color: 'white' }}>
            to explore the Chess.Fish Documentation
          </span>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}
