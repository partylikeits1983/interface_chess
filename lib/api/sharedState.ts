import { useState, useEffect } from 'react';
const ethers = require('ethers');

import alertWarningFeedbackConnectMetamask from '#/ui/alertWarningConnectMetamask';
import alertSuccessFeedback from '#/ui/alertSuccessFeedback';

type State = {
  chainID: number;
  useAPI: boolean;
};

let listeners: React.Dispatch<React.SetStateAction<State>>[] = [];
let state: State = {
  chainID: 80001,
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

// Helper function to check the API connection
/* async function checkAPIConnection(): Promise<boolean> {
  try {
    const response = await fetch('https://api.chess.fish');
    return response.status === 200;
  } catch (error) {
    console.error('API connection error:', error);
    return false;
  }
} */

// Helper function to check Metamask connection
async function checkMetaMaskConnection() {
  let useAPI = false;
  if (typeof window.ethereum !== 'undefined') {
    useAPI = false;
  } else {
    useAPI = true;
    alertWarningFeedbackConnectMetamask(
      'Connect Metamask to unlock all features',
    );
  }
  setState({ useAPI: useAPI });
}
