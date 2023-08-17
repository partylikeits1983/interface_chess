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
    image:
      'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/logo.png',
  },
  {
    label: 'WETH',
    image:
      'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png',
  },
  {
    label: 'USDT',
    image:
      'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7/logo.png',
  },
  {
    label: 'USDC',
    image:
      'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png',
  },
  {
    label: 'DAI',
    image:
      'https://raw.githubusercontent.com/dappradar/tokens/main/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f/logo.png',
  },
];

export { tokenAddressesByChainID, options };
