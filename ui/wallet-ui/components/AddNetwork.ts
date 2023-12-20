export const addArbitrumOne = async () => {
  const provider = (window as any).ethereum;

  if (provider) {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x66eed',
            chainName: 'Arbitrum One',
            rpcUrls: ['https://arb1.arbitrum.io/rpc'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://arbiscan.io/'],
          },
        ],
      });
    } catch (error) {
      console.error(
        'An error occurred while trying to switch to the Arbitrum One network:',
        error,
      );
    }
  } else {
    console.log(
      'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
    );
  }
};

export const addArbitrumSepolia = async () => {
  const provider = (window as any).ethereum;

  if (provider) {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x66eee',
            chainName: 'Arbitrum Sepolia',
            rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
            nativeCurrency: {
              name: 'AETH',
              symbol: 'AETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://sepolia.arbiscan.io'],
          },
        ],
      });
    } catch (error) {
      console.error(
        'An error occurred while trying to switch to the Arbitrum Sepolia network:',
        error,
      );
    }
  } else {
    console.log(
      'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
    );
  }
};
