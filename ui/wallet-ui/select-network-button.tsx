'use client';
import React from 'react';

import { ChakraProvider, useDisclosure, Button, Stack } from '@chakra-ui/react';
import NetworkButton from './components/NetworkButton';
import AccountModal from './components/AccountModal';
import theme from './theme';
import Layout from './components/Layout';
// import "@fontsource/inter";
import { getBalance } from './api/form';
import { useMetamask } from './components/Metamask';

function SelectNetworkButton() {
  return (
    <ChakraProvider theme={theme}>
      <NetworkButton />
    </ChakraProvider>
  );
}

export default SelectNetworkButton;
