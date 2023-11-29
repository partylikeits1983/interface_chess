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



export const addArbitrumGoerli = async () => {
    const provider = (window as any).ethereum;

    if (provider) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x66eed',
              chainName: 'Arbitrum Goerli',
              rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
              nativeCurrency: {
                name: 'AGOR',
                symbol: 'AGOR',
                decimals: 18,
              },
              blockExplorerUrls: ['https://goerli.arbiscan.io'],
            },
          ],
        });
      } catch (error) {
        console.error(
          'An error occurred while trying to switch to the Arbitrum Goerli network:',
          error,
        );
      }
    } else {
      console.log(
        'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
      );
    }
  };