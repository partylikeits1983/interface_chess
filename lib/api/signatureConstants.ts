export const domain = {
  chainId: 0,
  name: 'ChessFish',
  verifyingContract: '',
  version: '1',
};

export const moveTypes = {
  GaslessMove: [
    { name: 'wagerAddress', type: 'address' },
    { name: 'gameNumber', type: 'uint' },
    { name: 'moveNumber', type: 'uint' },
    { name: 'move', type: 'uint16' },
    { name: 'expiration', type: 'uint' },
  ],
};

export const delegationTypes = {
  Delegation: [
    { name: 'delegatorAddress', type: 'address' },
    { name: 'delegatedAddress', type: 'address' },
    { name: 'wagerAddress', type: 'address' },
  ],
};

export const walletGenerationTypes = {
  WalletGeneration: [{ name: 'wagerAddress', type: 'address' }],
};
