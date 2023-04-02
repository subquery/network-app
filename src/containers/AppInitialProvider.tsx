// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import { useInitContracts } from '@hooks';
import { Spinner } from '@subql/components';

/**
 *
 * This is the App Initial State
 * The App will initial ContractSDK, and store at global state
 */
export const AppInitProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { loading: loadingContract } = useInitContracts();

  if (loadingContract) {
    return <Spinner />;
  }

  return <div>{children}</div>;
};
