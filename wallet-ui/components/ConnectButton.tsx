import { useState, useEffect } from 'react';
import { Button, Box, Text } from '@chakra-ui/react';

import { formatEther } from '@ethersproject/units';

import { useMetamask } from './Metamask';
import Identicon from './Identicon';

type Props = {
  handleOpenModal: any;
};

export default function ConnectButton({ handleOpenModal }: Props) {
  const [account, setAccount] = useState('');

  const { connect, getAccounts, accounts, balance } = useMetamask();

  useEffect(() => {
    if (accounts == undefined) {
      setAccount(accounts[0]);
    }
  });

  // @dev this can be optimized..
  const handleConnectWallet = async () => {
    await connect();
    const accounts = await getAccounts();
    setAccount(accounts[0]);
  };

  return account ? (
    <Box
      display="flex"
      alignItems="center"
      background="gray.700"
      borderRadius="xl"
      py="0"
    >
      <Box px="3">
        <Text color="white" fontSize="md">
          <span>
            {parseFloat(formatEther(balance)).toFixed(3).toString()} ETH
          </span>
        </Text>
      </Box>
      <Button
        onClick={handleOpenModal}
        bg="gray.800"
        border="1px solid transparent"
        _hover={{
          border: '1px',
          borderStyle: 'solid',
          borderColor: 'blue.400',
          backgroundColor: 'gray.700',
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="md" fontWeight="medium" mr="2">
          {account &&
            `${account.slice(0, 6)}...${account.slice(
              account.length - 4,
              account.length,
            )}`}
        </Text>
        <Identicon account={account} />
      </Button>
    </Box>
  ) : (
    <Button
      onClick={handleConnectWallet}
      bg="blue.800"
      color="blue.300"
      fontSize="lg"
      fontWeight="medium"
      borderRadius="xl"
      border="1px solid transparent"
      _hover={{
        borderColor: 'blue.700',
        color: 'blue.400',
      }}
      _active={{
        backgroundColor: 'blue.800',
        borderColor: 'blue.700',
      }}
    >
      Connect to a wallet
    </Button>
  );
}
