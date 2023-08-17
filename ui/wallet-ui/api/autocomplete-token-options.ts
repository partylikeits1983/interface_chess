type TokenAddresses = {
  [key: string]: {
    [tokenName: string]: string;
  };
};

const tokenAddressesByChainID: TokenAddresses = {
  '80001': {
    // Mumbai
    WBTC: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    WETH: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    USDT: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    USDC: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    DAI: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    // ... other tokens
  },
  '44787': {
    // Celo Testnet
    WBTC: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    WETH: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    USDT: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    USDC: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    DAI: '0x9A78C513938Bfe1a5f6d98d849C6ed1F9A4C1d5c',
    // ... other tokens
  },
  // ... other chainIDs
};

const options = [
  {
    label: 'WBTC',
    image: '/tokens/wbtc.png',
  },
  {
    label: 'WETH',
    image: '/tokens/weth.png',
  },
  {
    label: 'USDT',
    image: '/tokens/usdt.png',
  },
  {
    label: 'USDC',
    image: '/tokens/usdc.png',
  },
  {
    label: 'DAI',
    image: '/tokens/dai.png',
  },
];

export { tokenAddressesByChainID, options };
