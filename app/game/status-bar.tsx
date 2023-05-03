'use client';

import { Box, Flex, Text } from '@chakra-ui/react';

export function StatusBar() {
  return (
    <Box w="100%" h="40px" bg="gray.100" p="4">
      <Flex justify="space-between">
        <Text>Opponent Address: 0x123...XYZ</Text>
        <Text>Amount: 100 USDC</Text>
        <Text>Time Per Move: 2h</Text>
        <Text>Games: 3</Text>
      </Flex>
    </Box>
  );
}
