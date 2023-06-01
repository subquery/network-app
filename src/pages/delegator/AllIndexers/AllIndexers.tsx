// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyList } from '@components';
import { useEra } from '@hooks';
import { Spinner, Typography } from '@subql/components';
import { useGetIndexersQuery } from '@subql/react-hooks';

import { SUB_INDEXERS } from '../../../containers/IndexerRegistryProjectSub';
import { getUseQueryFetchMore, mapAsync, mergeAsync, notEmpty, renderAsync } from '../../../utils';
import { IndexerList } from './IndexerList/IndexerList';

export const AllIndexers: React.FC = () => {
  const indexers = useGetIndexersQuery();
  const { currentEra } = useEra();
  const { t } = useTranslation();
  const fetchMore = (offset: number) => {
    getUseQueryFetchMore(indexers, { offset, first: 10 });
  };

  indexers.subscribeToMore({
    document: SUB_INDEXERS,
    updateQuery: (prev, { subscriptionData }) => {
      if (subscriptionData.data) {
        indexers.refetch();
      }
      return prev;
    },
  });

  return (
    <div>
      {renderAsync(
        mapAsync(
          ([data, curEra]) => ({
            data: data?.indexers?.nodes.filter(notEmpty),
            totalCount: data?.indexers?.totalCount,
            era: curEra?.index,
          }),
          mergeAsync(indexers, currentEra),
        ),
        {
          loading: () => <Spinner />,
          error: (error) => <Typography>{`Error: Failed to get Indexers: ${error.message}`}</Typography>,
          data: (data) => {
            if (!data || data?.totalCount === 0) {
              <EmptyList title={t('allIndexers.nonData')} description={t('allIndexers.desc')}></EmptyList>;
            }

            return (
              <IndexerList indexers={data.data} totalCount={data.totalCount} onLoadMore={fetchMore} era={data.era} />
            );
          },
        },
      )}
    </div>
  );
};
