// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from 'wagmi';

export const useIsLogin = () => {
  const { address } = useAccount();

  return !!address;
};
