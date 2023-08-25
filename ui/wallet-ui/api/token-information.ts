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

type TokenDetail = {
  label: string;
  image: string;
};

const getTokenDetails = (
  chainID: number,
  address: string,
): TokenDetail | null => {
  // const chainIDString = '80001'.toString();
  const chainIDString = chainID.toString();

  const chainData = tokenAddressesByChainID[chainIDString];

  console.log(chainIDString);
  console.log(chainData);
  if (!chainData) return null; // Return null if chainID is not found

  // Find token name by address for the given chain ID
  const tokenName = Object.keys(chainData).find(
    (key) => chainData[key] === address,
  );

  if (!tokenName) return null; // Return null if token name not found

  console.log(tokenName);
  // Find the token details by name from the options array
  const tokenDetail = options.find((option) => option.label === tokenName);

  console.log(tokenDetail);
  return tokenDetail || null; // Return token details or null if not found
};

export { tokenAddressesByChainID, options, getTokenDetails };
