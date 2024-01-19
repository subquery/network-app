// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { networkLink } from '@containers/QueryApolloProvider';
import { SUPPORTED_NETWORK } from '@containers/Web3';
import { NetworkClient } from '@subql/network-clients';

import { useEthersProviderWithPublic, useEthersSigner } from './useEthersProvider';

export function useNetworkClient(): NetworkClient | undefined {
  const [networkClient, setNetworkClient] = React.useState<NetworkClient | undefined>();
  const { signer } = useEthersSigner();
  const provider = useEthersProviderWithPublic();

  React.useEffect(() => {
    async function getNetworkClient() {
      const client = await NetworkClient.create(SUPPORTED_NETWORK, signer || provider, undefined, {
        queryClientOptions: {
          link: networkLink,
        },
      });
      setNetworkClient(client);
    }

    getNetworkClient();
  }, []);

  return networkClient;
}
