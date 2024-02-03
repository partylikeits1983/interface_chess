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

const localStorageKey = 'lastClearTime';

export function useStateManager(
  initialState?: Partial<State>,
): [State, typeof setState] {
  const mergedInitialState = { ...state, ...initialState };
  const newSetState = useState(mergedInitialState)[1];

  useEffect(() => {
    listeners.push(newSetState);
    checkMetaMaskConnection();

    const interval = setInterval(() => {
      const lastClearTime = localStorage.getItem(localStorageKey);
      if (lastClearTime) {
        const currentTime = new Date().getTime();
        if (
          currentTime - parseInt(lastClearTime, 10) >
          3 * 24 * 60 * 60 * 1000
        ) {
          localStorage.clear();
          localStorage.setItem(localStorageKey, currentTime.toString());
        }
      } else {
        localStorage.setItem(localStorageKey, new Date().getTime().toString());
      }
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => {
      listeners = listeners.filter((listener) => listener !== newSetState);
      clearInterval(interval);
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
