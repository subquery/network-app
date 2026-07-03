// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { captureEvent } from '@sentry/react';
import { providers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { type HttpTransport } from 'viem';
import { base, mainnet } from 'viem/chains';
import { Config, usePublicClient } from 'wagmi';
import { type UsePublicClientReturnType, useWalletClient } from 'wagmi';
import { type GetWalletClientData } from 'wagmi/query';

export function publicClientToProvider(publicClient: UsePublicClientReturnType) {
  if (!publicClient) {
    return new providers.JsonRpcProvider(base.rpcUrls.default.http[0]);
  }
  const { chain, transport } = publicClient;

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  if (transport.type === 'fallback') {
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    );
  }

  return new providers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
export function useEthersProviderWithPublic({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId });
  return React.useMemo(() => publicClientToProvider(publicClient), [publicClient]);
}

let requestId = 0;

export function walletClientToSignerAndProvider(walletClient: GetWalletClientData<Config, number>) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new providers.Web3Provider(
    {
      ...transport,
    },
    network,
  );
  const signer = provider.getSigner(account.address);

  return {
    provider,
    signer,
  };
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });

  return React.useMemo(
    () => (walletClient ? walletClientToSignerAndProvider(walletClient) : { signer: undefined, provider: undefined }),
    [walletClient],
  );
}
