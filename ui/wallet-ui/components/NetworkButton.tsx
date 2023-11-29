import { useEffect, useState } from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';

import { ethers } from 'ethers';

import { useStateManager } from '../../../lib/api/sharedState';

const NETWORK_NAMES: { [key: string]: string } = {
  0x1: 'Ethereum Mainnet',
  0xa4b1: 'Arbitrum',
  0x38: 'BSC',
  0xaa36a7: 'Sepolia Testnet',
  0x66eee: 'Arbitrum Sepolia Testnet',
  0x66eed: 'Arbitrum Goerli Testnet',
};

export default function NetworkButton(): JSX.Element {
  const [selectedNetwork, setSelectedNetwork] =
    useState<string>('Select Network');

  const initialChainID = { chainID: 421614 };
  const [globalState, setGlobalState] = useStateManager(initialChainID);

  const handleNetworkChange = async (network: string): Promise<void> => {
    // Define chainId based on selected network
    let chainId: string;
    switch (network) {
      case 'Mainnet':
        chainId = '0x1';
        break;
      case 'Arbitrum':
        chainId = '0xa4b1';
        break;
      case 'Celo Mainnet':
        chainId = '0xa4ec';
        break;
      case 'BSC':
        chainId = '0x38';
        break;
      case 'Sepolia Testnet':
        chainId = '0xaa36a7';
        break;
      case 'Arbitrum Goerli Testnet':
        chainId = '0x66eed';
        break;
      case 'Alphajores Testnet':
        chainId = '0xaef3';
        break;
      // add more cases if you have other networks
      default:
        console.log('Network not recognized');
        return;
    }

    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Call Metamask API to change the network
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          // Access the `ethereum` object through the provider
          await provider.send('wallet_switchEthereumChain', [{ chainId }]);

          // Once the network switch is confirmed, reload the page
          window.location.reload();
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const getConnectedNetwork = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();

        setSelectedNetwork(NETWORK_NAMES[network.chainId]);
        setGlobalState({ chainID: network.chainId });
      };
      getConnectedNetwork();
    } else {
      // default to arbitrum
      setSelectedNetwork(NETWORK_NAMES[0xa4b1]);
    }
  }, []);

  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
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
          {selectedNetwork}
        </MenuButton>
        <div style={{ position: 'relative', zIndex: 100 }}>
          <MenuList>
            <MenuItem onClick={() => handleNetworkChange('Mainnet')}>
              Ethereum Mainnet (coming soon)
            </MenuItem>
            <MenuItem onClick={() => handleNetworkChange('Arbitrum')}>
              Arbitrum (coming soon)
            </MenuItem>
            <MenuDivider />

            <MenuItem onClick={() => handleNetworkChange('Sepolia Testnet')}>
              Sepolia Testnet
            </MenuItem>

            <MenuItem
              onClick={() => handleNetworkChange('Arbitrum Goerli Testnet')}
            >
              Arbitrum Goerli Testnet
            </MenuItem>

          </MenuList>
        </div>
      </Menu>
    </>
  );
}
