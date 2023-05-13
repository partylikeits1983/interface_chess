'use client';

import {
  Box,
  OrderedList,
  ListItem,
  Text,
  Link,
  ChakraProvider,
} from '@chakra-ui/react';

export default function Docs() {
  return (
    <ChakraProvider>
      <Link href="https://docs.chess.fish" isExternal>
        Go to docs.chess.fish
      </Link>
    </ChakraProvider>
  );
}
