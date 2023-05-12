'use client';

import {
  Box,
  OrderedList,
  ListItem,
  StatLabel,
  StatArrow,
  StatNumber,
  StatHelpText,
  StatGroup,
  Stat,
  ChakraProvider,
} from '@chakra-ui/react';

export default function Docs() {
  return (
    <ChakraProvider>
      <StatGroup color="white">
        <Stat>
          <StatLabel>Sent</StatLabel>
          <StatNumber>345,670</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Clicked</StatLabel>
          <StatNumber>45</StatNumber>
          <StatHelpText>
            <StatArrow type="decrease" />
            9.05%
          </StatHelpText>
        </Stat>
      </StatGroup>
    </ChakraProvider>
  );
}
