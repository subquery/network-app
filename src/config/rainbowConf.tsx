// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  talismanWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, mainnet, sepolia, WagmiConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import '@rainbow-me/rainbowkit/styles.css';

// goerli and mainnet just for get data actually not supported
const supportedChains = import.meta.env.VITE_NETWORK === 'testnet' ? [baseSepolia, sepolia] : [base, mainnet];

export const tipsChainIds: number[] = import.meta.env.VITE_NETWORK === 'testnet' ? [baseSepolia.id] : [base.id];
export const tipsL1ChainIds: number[] =
  import.meta.env.VITE_NETWORK === 'testnet' ? [sepolia.id, baseSepolia.id] : [mainnet.id, base.id];
// This should ok. It seems is a bug of Ts.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { chains, publicClient } = configureChains(supportedChains, [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId: 'c7ea561f79adc119587d163a68860570', chains }),
      coinbaseWallet({ appName: 'SQN Explorer', chains }),
      walletConnectWallet({ projectId: 'c7ea561f79adc119587d163a68860570', chains }),
      talismanWallet({ chains }),
      rainbowWallet({ projectId: 'c7ea561f79adc119587d163a68860570', chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [...connectors()],
  publicClient,
});

export const RainbowProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} locale="en" coolMode>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
