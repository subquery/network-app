// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  talismanWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, WagmiProvider } from 'wagmi';
import { base, baseSepolia, mainnet, sepolia } from 'wagmi/chains';

import '@rainbow-me/rainbowkit/styles.css';

export const tipsChainIds: number[] = import.meta.env.VITE_NETWORK === 'testnet' ? [baseSepolia.id] : [base.id];
export const tipsL1ChainIds: number[] =
  import.meta.env.VITE_NETWORK === 'testnet' ? [sepolia.id, baseSepolia.id] : [mainnet.id, base.id];

// coinbaseWallet.preference = 'smartWalletOnly';

export const config = getDefaultConfig({
  appName: 'SubQuery Network App',
  projectId: 'c7ea561f79adc119587d163a68860570',
  chains: [base, baseSepolia, mainnet, sepolia],
  transports: {
    [base.id]: http(import.meta.env.VITE_SUBQUERY_OFFICIAL_BASE_RPC),
    [mainnet.id]: http(import.meta.env.VITE_SUBQUERY_OFFICIAL_ETH_RPC),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [sepolia.id]: http('https://ethereum-sepolia.rpc.subquery.network/public'),
  },
  wallets: [
    {
      groupName: 'Recommended Wallets',
      wallets: [
        metaMaskWallet,
        () =>
          coinbaseWallet({
            appName: 'SubQuery Network App',
            appIcon: 'https://subquery.network/favicon.ico',
          }),
        () => {
          const safeClient = safeWallet();
          return safeClient;
        },
        walletConnectWallet,
        talismanWallet,
        rainbowWallet,
      ],
    },
  ],
});

const queryClient = new QueryClient();

export const RainbowProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
