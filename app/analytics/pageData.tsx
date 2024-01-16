'use client';

import React, { useEffect, useState } from 'react';

import { Stack, Divider, Heading, ChakraProvider } from '@chakra-ui/react';

import Analytics from './analytics';
import CurrentGames from './currentGames';

import { useStateManager } from '#/lib/api/sharedState';

const PageData: React.FC = () => {
  const [globalState, setGlobalState] = useStateManager();

  const handleToggle = () => {
    setGlobalState({ ...globalState, useAPI: !globalState.useAPI });
  };
  return (
    <ChakraProvider>
      <Stack spacing={8}>
        <Analytics useAPI={globalState.useAPI} handleToggle={handleToggle} />
        <CurrentGames useAPI={globalState.useAPI} />
      </Stack>
    </ChakraProvider>
  );
};

export default PageData;
