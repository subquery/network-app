// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useEra, useIndexers } from '../../../../containers';
import styles from './AllIndexers.module.css';
import { getUseQueryFetchMore, mapAsync, mergeAsync, notEmpty, renderAsync } from '../../../../utils';
import { IndexerList } from './IndexerList/IndexerList';

export const AllIndexers: React.VFC = () => {
  const indexers = useIndexers({});
  const { currentEra } = useEra();
  const { t } = useTranslation();

  const fetchMore = (offset: number) => {
    getUseQueryFetchMore(indexers, { offset });
  };

  return (
    <>
      <div className={styles.dataContent}>
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
                return <Typography>{`No Indexer available.`}</Typography>;
              }

              return (
                <IndexerList indexers={data.data} totalCount={data.totalCount} onLoadMore={fetchMore} era={data.era} />
              );
            },
          },
        )}
      </div>
    </>
  );
};
