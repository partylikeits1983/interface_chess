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
      case 'mainnet':
        chainId = '1';
        break;
      case 'ropsten':
        chainId = '80001';
        break;
      case 'rinkeby':
        chainId = '0x4';
        break;
      case 'goerli':
        chainId = '0x5';
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
          <MenuItem onClick={() => handleNetworkChange('Ropsten')}>
            Ropsten
          </MenuItem>
          <MenuItem onClick={() => handleNetworkChange('Kovan')}>
            Kovan
          </MenuItem>
          <MenuItem onClick={() => handleNetworkChange('Rinkeby')}>
            Rinkeby
          </MenuItem>
          <MenuItem onClick={() => handleNetworkChange('Goerli')}>
            Goerli
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}
