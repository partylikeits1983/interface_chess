import { useState, useEffect } from 'react';
const ethers = require('ethers');

import alertWarningFeedbackConnectMetamask from '#/ui/alertWarningConnectMetamask';

type State = {
  chainID: number;
  useAPI: boolean;
};

let listeners: React.Dispatch<React.SetStateAction<State>>[] = [];
let state: State = {
  chainID: 42161,
  useAPI: false,
};

export function useStateManager(
  initialState?: Partial<State>,
): [State, typeof setState] {
  const mergedInitialState = { ...state, ...initialState };
  const newSetState = useState(mergedInitialState)[1];

  useEffect(() => {
    listeners.push(newSetState);
    checkMetaMaskConnection();

    return () => {
      listeners = listeners.filter((listener) => listener !== newSetState);
    };
  }, [newSetState]);

  return [state, setState];
}

function setState(newState: Partial<State>) {
  state = { ...state, ...newState };
  for (let listener of listeners) {
    listener(state);
  }
}

// Helper function to check Metamask connection
export async function checkMetaMaskConnection() {
  if (window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setState({ chainID: network.chainId, useAPI: false }); // Update chain ID based on Metamask network
      return true;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  } else {
    setState({ useAPI: true });
    alertWarningFeedbackConnectMetamask(
      'Connect Metamask to unlock all features',
    );
    return false;
  }
}
