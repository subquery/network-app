// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AbstractConnector } from '@web3-react/abstract-connector';
import { SUPPORTED_CONNECTORS } from '../containers/Web3';

export const getConnectorConfig = (connector: AbstractConnector | undefined) => {
  const sortedConnector = Object.keys(SUPPORTED_CONNECTORS).find(
    (supprotedConnector) => SUPPORTED_CONNECTORS[supprotedConnector].connector === connector,
  );

  if (sortedConnector) {
    return SUPPORTED_CONNECTORS[sortedConnector];
  }

  return SUPPORTED_CONNECTORS.INJECTED;
};
