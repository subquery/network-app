// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import { TOP_100_INDEXERS } from './QueryApolloProvider';

const GET_TOP_INDEXERS = gql`
  query GetTopIndexers {
    topIndexers {
      description
      data
    }
  }
`;

export function useTopIndexers(): QueryResult<any> {
  return useQuery(GET_TOP_INDEXERS, {
    context: { clientName: TOP_100_INDEXERS },
    pollInterval: 10000,
  });
}

export interface ITopIndexers {
  indexer: string;
  ranking: number;
  upTime: string;
  ownStake: string;
  delegated: string;
  eraRewardsCollection: string;
  timeToUpgrade: string;
  enableSSL: string;
  socialCredibility: string;
}

const genRandomData = (): Array<ITopIndexers> => {
  const addresses = [
    '0xCef192586b70e3Fc2FAD76Dd1D77983a30d38D04',
    '0x0421700EE1890d461353A54eAA481488f440A68f',
    '0xB55924636Df4a8dE7f8F3D7858Ff306712109d19',
    '0x59ce189fd40611162017deb88d826C3485f41e0D',
  ];

  const frequency = ['Frequent', 'InFrequent'];
  const yesOrNo = ['Yes', 'No'];
  const enableStatus = ['Enabled', 'Disabled'];

  const mathRandom = (max = 100) => Math.floor(Math.random() * max);

  return addresses.map((address) => ({
    indexer: address,
    ranking: mathRandom(),
    upTime: `${mathRandom()} %`,
    ownStake: `${mathRandom()} %`,
    delegated: `${mathRandom()} %`,
    eraRewardsCollection: frequency[mathRandom(2)],
    timeToUpgrade: frequency[mathRandom(2)],
    enableSSL: yesOrNo[mathRandom(2)],
    socialCredibility: enableStatus[mathRandom(2)],
  }));
};

export const topIndexersMock = [
  {
    request: {
      query: GET_TOP_INDEXERS,
    },
    result: {
      data: {
        topIndexers: {
          description: 'This is mock data for top 100 indexers',
          data: genRandomData(),
        },
      },
    },
  },
];
