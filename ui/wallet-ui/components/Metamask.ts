import * as ethers from 'ethers';
import {
  ExternalProvider,
  JsonRpcSigner,
  Network,
  Web3Provider,
} from '@ethersproject/providers';

import { useState } from 'react';

import detectEthereumProvider from '@metamask/detect-provider';

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

type ExtensionForProvider = {
  on: (event: string, callback: (...params: any) => void) => void;
};

// Adds on stream support for listening events.
// see https://github.com/ethers-io/ethers.js/discussions/3230
type GenericProvider = ExternalProvider & ExtensionForProvider;

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

function useMetamask() {
  const [provider, setProvider] = useState<
    ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider | null
  >(null);
  // Signer | Provider | undefined
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<ethers.ethers.BigNumberish>('');
  const [network, setNetwork] = useState<Network | null>(null);

  const setupProvider = async () => {
    let provider, signer, accounts, isWalletConnected;
    const detectedProvider = await detectEthereumProvider();

    if (detectedProvider && detectedProvider.isMetaMask) {
      try {
        window.ethereum = detectedProvider;
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        accounts = await provider.listAccounts();
        await provider.send('eth_requestAccounts', []);
        // console.log('Web3 provider is set');
        isWalletConnected = true;
      } catch (error) {
        console.error('User rejected the connection request.', error);
        provider = null; // reset provider to null
        signer = null;
        accounts = null;
        isWalletConnected = false;
      }
    }

    // If provider is not set (either window.ethereum is not available or user rejected the connection)
    // then use the custom JSON-RPC provider
    if (!provider) {
      const customRpcUrl = 'https://rpc.ankr.com/polygon_mumbai';
      provider = new ethers.providers.JsonRpcProvider(customRpcUrl);
      signer = provider;
      accounts = undefined;
      isWalletConnected = false;
      console.log('JSON-RPC provider is set - Form.ts');
    }

    return provider;
  };

  const connect = async () => {
    const provider = await setupProvider();

    if (provider instanceof ethers.providers.Web3Provider) {
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      const signer = provider.getSigner();
      const balance = await provider.getBalance(accounts[0]);

      setNetwork(network);
      setAccounts(accounts);
      setSigner(signer);
      setBalance(balance);

      return true;
    } else {
      console.log('Connect a MetaMask Wallet');
      return false;
    }
  };

  const getAccounts = async () => {
    const provider = await setupProvider();
    const accounts = provider.listAccounts ? await provider.listAccounts() : [];
    setAccounts(accounts);
    return accounts;
  };

  const getBalance = async (account: string) => {
    const provider = await setupProvider();
    const balance = await provider.getBalance(account);
    return balance;
  };

  const listenToEvents = (provider: Web3Provider) => {
    (window.ethereum as GenericProvider).on(
      'accountsChanged',
      (acc: string[]) => {
        setAccounts(acc);
      },
    );
    (window.ethereum as GenericProvider).on(
      'networkChanged',
      async (net: number) => {
        console.log('networkChanged', net);
      },
    );
    (window.ethereum as GenericProvider).on(
      'disconnect',
      (error: ProviderRpcError) => {
        throw Error(error.message);
      },
    );
  };

  const deactivate = async () => {
    setNetwork(null);
    setAccounts([]);
    setSigner(null);
  };

  /*   const sendTransaction = async (
    from: string,
    to: string,
    valueInEther: string,
  ) => {
    const provider = setupProvider();
    const params = [
      {
        from,
        to,
        value: ethers.utils.parseUnits(valueInEther, 'ether').toHexString(),
      },
    ];
    const transactionHash = await provider.send('eth_sendTransaction', params);
    return transactionHash;
  };
 */
  return {
    provider,
    signer,
    accounts,
    network,
    balance,
    getBalance,
    connect,
    setupProvider,
    getAccounts,
    // sendTransaction,
    deactivate,
  };
}

export { useMetamask };
