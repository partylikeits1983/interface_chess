import React, { useState, useEffect } from 'react';
import { Flex, Text, Spinner } from '@chakra-ui/react';

import { GetDividendBalances, GetDividendBalances_NOMETAMASK } from '#/lib/api/form';

import { useStateManager, checkMetaMaskConnection } from '#/lib/api/sharedState';

const TokenIcons = [
  { symbol: 'DAI', iconSrc: 'tokens/dai.png' },
  { symbol: 'USDC', iconSrc: 'tokens/usdc.png' },
  { symbol: 'USDT', iconSrc: 'tokens/usdt.png' },
  { symbol: 'WBTC', iconSrc: 'tokens/wbtc.png' },
  { symbol: 'WETH', iconSrc: 'tokens/weth.png' },
];

type TokenBalanceProps = {
  symbol: string;
  iconSrc: string;
  balance: number;
  isLoading: boolean;
};

function TokenBalance({
  symbol,
  iconSrc,
  balance,
  isLoading,
}: TokenBalanceProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={iconSrc}
        alt={`${symbol} icon`}
        style={{
          height: '44px',
          width: '44px',
          marginBottom: '6px',
        }}
      />
      <div>
        <Text>{symbol}</Text>
        {isLoading ? (
          <Spinner size="sm" /> // Spinner when balance is loading
        ) : (
          <Text fontWeight="bold">{balance}</Text> // Display balance when loaded
        )}
      </div>
    </div>
  );
}

function TokenBalances() {
  const [balances, setBalances] = useState<number[]>([0, 0, 0, 0, 0]);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  useEffect(() => {
    async function fetchBalances() {
      const hasMetamask = await checkMetaMaskConnection();

      if (hasMetamask) {
        const fetchedBalances = await GetDividendBalances();
        setBalances(fetchedBalances);
      } else {
        const fetchedBalances = await GetDividendBalances_NOMETAMASK();
        setBalances(fetchedBalances);
      }

      setIsLoading(false); // Set loading state to false once balances are fetched
    }

    fetchBalances();
  }, []);

  return (
    <Flex justifyContent="space-around" padding="0">
      {TokenIcons.map((token, index) => (
        <TokenBalance
          key={index}
          symbol={token.symbol}
          iconSrc={token.iconSrc}
          balance={balances[index]}
          isLoading={isLoading} // Pass isLoading state to TokenBalance
        />
      ))}
    </Flex>
  );
}

export default TokenBalances;
