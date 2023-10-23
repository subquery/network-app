// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { decodeIpfsRaw, useIPFS } from '@containers/IPFS';
import { parseError } from '@utils/parseError';

import { IndexerDetails } from 'src/models';

export const useFetchMetadata = () => {
  const { catSingle } = useIPFS();

  const fetchMetadata = async (indexerCid: string | undefined) => {
    if (!indexerCid)
      return {
        name: '',
        url: '',
        image: '',
      };
    try {
      const res = await catSingle(indexerCid);
      const decodeMetadata = decodeIpfsRaw<IndexerDetails>(res);
      return decodeMetadata;
    } catch (e) {
      parseError(e);
      return {
        name: '',
        url: '',
        image: '',
      };
    }
  };

  return fetchMetadata;
};
