import { useState } from 'react';
import { Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';

import { ethers } from 'ethers';

export default function NetworkButton(): JSX.Element {
  const [selectedNetwork, setSelectedNetwork] =
    useState<string>('Select Network');

  const handleNetworkChange = async (network: string): Promise<void> => {
    setSelectedNetwork(network);

    // Define chainId based on selected network
    let chainId: string;
    switch (network) {
      case 'Mainnet':
        chainId = '0x1';
        break;
      case 'Polygon':
        chainId = '0x89';
        break;
      case 'BSC':
        chainId = '0x38';
        break;
      case 'Mumbai':
        chainId = '0x13881';
        break;
      case 'kovan':
        chainId = '0x2a';
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
        }
      } catch (error) {
        console.error(error);
        // This error code indicates that the chain has not been added to MetaMask.
        console.log(error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
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
        <MenuList>
          <MenuItem onClick={() => handleNetworkChange('Mainnet')}>
            Mainnet
          </MenuItem>
          <MenuItem onClick={() => handleNetworkChange('Polygon')}>
            Polygon
          </MenuItem>
          <MenuItem onClick={() => handleNetworkChange('BSC')}>BSC</MenuItem>
          <MenuItem onClick={() => handleNetworkChange('Mumbai')}>
            Mumbai Testnet
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}
