import { useState, useEffect } from 'react';
import { Button, Box, Text } from '@chakra-ui/react';

export default function NetworkButton() {
  return (
    <Button
      bg="gray.800"
      color="gray.300"
      fontSize="lg"
      fontWeight="medium"
      borderRadius="xl"
      border="1px solid transparent"
      _hover={{
        borderColor: 'gray.700',
        color: 'gray.400',
      }}
      _active={{
        backgroundColor: 'gray.800',
        borderColor: 'gray.700',
      }}
    >
      Select Network
    </Button>
  );
}
