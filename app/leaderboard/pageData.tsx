'use client';

import React, { useEffect, useState } from 'react';

import { Stack, Divider, Heading, ChakraProvider } from '@chakra-ui/react';

import Leaderboard from './leaderboard';

const PageData: React.FC = () => {
  const [useAPI, setUseAPI] = useState(false);

  return (
    <ChakraProvider>
      <Stack spacing={8}>
        <Leaderboard useAPI={useAPI} handleToggle={() => setUseAPI(!useAPI)} />
      </Stack>
    </ChakraProvider>
  );
};

export default PageData;
