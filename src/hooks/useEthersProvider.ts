// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { providers } from 'ethers';
import { type HttpTransport } from 'viem';
import { base, mainnet } from 'viem/chains';
import { type PublicClient, usePublicClient } from 'wagmi';
import { useWalletClient, type WalletClient } from 'wagmi';

export function publicClientToProvider(publicClient: PublicClient) {
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

export function walletClientToSignerAndProvider(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new providers.Web3Provider(
    {
      ...transport,
      async request(request, ...rest) {
        try {
          const fetchUrl = {
            [base.id]: import.meta.env.VITE_SUBQUERY_OFFICIAL_BASE_RPC,
            [mainnet.id]: import.meta.env.VITE_SUBQUERY_OFFICIAL_ETH_RPC,
          }[chain.id];
          if (fetchUrl) {
            requestId += 1;
            const res = await fetch(fetchUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                // seems the id in JSONRPC is used for sort
                id: requestId,
                ...request,
              }),
            });
            const { result, error } = await res.json();
            if (!result) {
              throw new Error(error);
            }
            return result;
          }
        } catch (e) {
          return transport.request(request, ...rest);
        }

        return transport.request(request, ...rest);
      },
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
