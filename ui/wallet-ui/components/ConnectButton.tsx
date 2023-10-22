import { useState, useEffect } from 'react';
import { Button, Box, Text } from '@chakra-ui/react';

import { formatEther } from '@ethersproject/units';

import { useMetamask } from './Metamask';
import { getChainId } from '../../../app/api/form';

import Identicon from './Identicon';

import networks from '#/app/api/tokenAddresses.json';

type Props = {
  handleOpenModal: any;
};

const getCurrencyByChainId = async (): Promise<string> => {
  const chainId = await getChainId();

  // Find the network object with the matching chainID
  const networkObj = networks.find((network) => network.chainID === chainId);

  // If found, return the currency. If not, return "ETH" as a default.
  return networkObj?.currency || 'ETH';
};

export default function ConnectButton({ handleOpenModal }: Props) {
  const { connect, getAccounts, accounts, getBalance } = useMetamask();
  const [account, setAccount] = useState<string | null>(null);
  const [formattedBalance, setFormattedBalance] = useState<string>('');

  const [nativeCurrency, setNativeCurrency] = useState('ETH');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedAccount = localStorage.getItem('account');
      if (cachedAccount) {
        setAccount(cachedAccount);
      }
    }
  }, []);

  // Update account state when accounts changes
  useEffect(() => {
    if (account == undefined) {
      connect();
    }
    setAccount(accounts[0]);
  });

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        const balance = await getBalance(account);
        const formattedBalance = parseFloat(formatEther(balance))
          .toFixed(3)
          .toString();
        setFormattedBalance(formattedBalance);

        const currency = await getCurrencyByChainId();

        setNativeCurrency(currency);
      }
    };

    if (account) {
      fetchBalance();
    }
  }, [account]);

  const handleConnectWallet = async () => {
    // Check if wallet is already connected
    if (!account) {
      await connect();
      const accounts = await getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('account', accounts[0]); // set account in local storage
        }
      }
    }
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
            {formattedBalance} {nativeCurrency}
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
          borderColor: 'gray.400',
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
      Connect to a wallet
    </Button>
  );
}
