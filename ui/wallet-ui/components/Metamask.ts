import * as ethers from 'ethers';
import {
  ExternalProvider,
  JsonRpcSigner,
  Network,
  Web3Provider,
} from '@ethersproject/providers';

import { useState } from 'react';

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
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  // Signer | Provider | undefined
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<ethers.ethers.BigNumberish>('');
  const [network, setNetwork] = useState<Network | null>(null);

  const setupProvider = () => {
    if (!window.ethereum) throw Error('Could not find Metamask extension');
    if (provider) return provider;

    const newProvider = new Web3Provider(window.ethereum);
    listenToEvents(newProvider);
    setProvider(newProvider);

    return newProvider;
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

  const connect = async () => {
    const provider = setupProvider();
    const accounts: string[] = await provider.send('eth_requestAccounts', []);
    const network: Network = await provider.getNetwork();
    const signer: JsonRpcSigner = provider.getSigner();
    const balance = await provider.getBalance(accounts[0]);

    setNetwork(network);
    setAccounts(accounts);
    setSigner(signer);
    setBalance(balance);
  };

  const deactivate = async () => {
    setNetwork(null);
    setAccounts([]);
    setSigner(null);
  };

  const getAccounts = async () => {
    const provider = setupProvider();
    const accounts: string[] = await provider.send('eth_accounts', []);
    setAccounts(accounts);
    return accounts;
  };

  const getBalance = async (account: string) => {
    const provider = setupProvider();
    const balance = provider.getBalance(account);
    return balance;
  };

  const sendTransaction = async (
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

  return {
    signer,
    accounts,
    network,
    balance,
    getBalance,
    connect,
    getAccounts,
    sendTransaction,
    deactivate,
  };
}

export { useMetamask };
