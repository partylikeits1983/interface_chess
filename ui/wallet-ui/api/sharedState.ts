// sharedState.ts

import { useState, useEffect } from 'react';

type State = {
  chainID: number;
};

let listeners: React.Dispatch<React.SetStateAction<State>>[] = [];
let state: State = {
  chainID: 80001, // You can set the default chainID value here.
};

export function useStateManager(
  initialState?: Partial<State>,
): [State, typeof setState] {
  const mergedInitialState = { ...state, ...initialState };
  const newSetState = useState(mergedInitialState)[1];

  useEffect(() => {
    listeners.push(newSetState);

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
