// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import '@rainbow-me/rainbowkit/styles.css';
const supportedChains = import.meta.env.VITE_NETWORK === 'testnet' ? [polygonMumbai] : [polygon];

// This should ok. It seems is a bug of Ts.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { chains, publicClient } = configureChains(supportedChains, [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: 'SubQuery Explorer',
  projectId: 'c7ea561f79adc119587d163a68860570',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
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
