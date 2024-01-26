'use client';

import React, { useEffect, useState } from 'react';
import { Stack, Divider, Heading, ChakraProvider } from '@chakra-ui/react';

import Analytics from './analytics';
import CurrentGames from './currentGames';
import {
  useStateManager,
  checkMetaMaskConnection,
} from '#/lib/api/sharedState';

const PageData: React.FC = () => {
  const [globalState, setGlobalState] = useStateManager();
  const [isConnected, setIsConnected] = useState(false);

  const handleToggle = () => {
    setGlobalState({ ...globalState, useAPI: !globalState.useAPI });
  };

  useEffect(() => {
    const checkConnection = async () => {
      const connectionStatus = await checkMetaMaskConnection();

      if (connectionStatus) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);



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
