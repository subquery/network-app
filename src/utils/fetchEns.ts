// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ethers } from 'ethers';

export async function fetchEns(address: string): Promise<string | undefined> {
  const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth'); //ethereum mainet endpoint
  const ens = await provider.lookupAddress(address);
  return ens;
}
