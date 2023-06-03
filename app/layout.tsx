import '#/styles/globals.css';

import Byline from '#/ui/byline';
import { GlobalNav } from '#/ui/global-nav';
import { Metadata } from 'next';
import React from 'react';
import ConnectWalletButton from '../ui/wallet-ui/connect-wallet-button';
import SelectNetworkButton from 'ui/wallet-ui/select-network-button';

export const metadata: Metadata = {
  title: {
    default: 'Chess.fish',
    template: '%s | Chess.fish',
  },
  description: 'Chess.fish router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body className="bg-gray-1100 overflow-y-scroll bg-[url('/grid.svg')] pb-36">
        <GlobalNav />

        <div className="lg:pl-72">
          <div className="mx-auto max-w-4xl space-y-8 px-2 pt-20 lg:px-8 lg:py-8">
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ marginRight: '10px' }}>
                <SelectNetworkButton />
              </div>
              <ConnectWalletButton />
            </div>

            <div className="bg-vc-border-gradient rounded-lg p-px shadow-lg shadow-black/20">
              <div className="rounded-lg bg-black p-3.5 lg:p-6">{children}</div>
            </div>
            <Byline className="fixed sm:hidden" />
          </div>
        </div>
      </body>
    </html>
  );
}
