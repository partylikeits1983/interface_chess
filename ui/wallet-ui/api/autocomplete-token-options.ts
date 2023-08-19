import rawData from './tokenAddresses.json';

type TokenAddresses = {
  [key: string]: {
    [tokenName: string]: string;
  };
};

// Process the raw JSON data to fit the TokenAddresses format
const tokenAddressesByChainID: TokenAddresses = rawData.reduce(
  (acc, current) => {
    const chainIDString = current.chainID.toString();

    const { network, chainID, ...tokens } = current;

    acc[chainIDString] = tokens;

    return acc;
  },
  {} as TokenAddresses,
);

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
