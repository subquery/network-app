// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3 } from '@containers/Web3';

export const useIsLogin = () => {
  const { account } = useWeb3();

  return !!account;
};
