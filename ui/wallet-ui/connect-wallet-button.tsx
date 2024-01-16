'use client';
import React from 'react';

import { ChakraProvider, useDisclosure, Button, Stack } from '@chakra-ui/react';
import ConnectButton from './components/ConnectButton';
import AccountModal from './components/AccountModal';
import theme from './theme';
import Layout from './components/Layout';
// import "@fontsource/inter";
import { getBalance } from 'lib/api/form';
import { useMetamask } from './components/Metamask';

function ConnectWalletButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { connect, accounts } = useMetamask();
  
  const handleGetBalance = async () => {
    await connect();
    getBalance(accounts[0]);
  };

  return (
    <ChakraProvider theme={theme}>
      <Stack direction={'column'} spacing={4} align="center">
        <ConnectButton handleOpenModal={onOpen} />
        <AccountModal isOpen={isOpen} onClose={onClose} />
      </Stack>
    </ChakraProvider>
  );
}

export default ConnectWalletButton;
