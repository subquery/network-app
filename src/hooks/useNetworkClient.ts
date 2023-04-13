// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SUPPORTED_NETWORK } from '@containers/Web3';
import { NetworkClient } from '@subql/network-clients';
import * as React from 'react';

export function useNetworkClient(): NetworkClient | undefined {
  const [networkClient, setNetworkClient] = React.useState<NetworkClient | undefined>();

  React.useEffect(() => {
    async function getNetworkClient() {
      const client = await NetworkClient.create(SUPPORTED_NETWORK);
      setNetworkClient(client);
    }

    getNetworkClient();
  }, []);

  return networkClient;
}
