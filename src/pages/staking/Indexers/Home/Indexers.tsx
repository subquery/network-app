// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useIndexers } from '../../../../containers';
import { AppPageHeader } from '../../../../components';
import styles from './Indexers.module.css';
import { mapAsync, notEmpty, renderAsync } from '../../../../utils';
import { IndexerList } from '../IndexerList/IndexerList';

export const Indexers: React.VFC = () => {
  const indexers = useIndexers({});
  const { t } = useTranslation();

  const fetchMore = (offset: number) => {
    indexers.fetchMore({
      variables: {
        offset,
      },
    });
  };

  return (
    <>
      <AppPageHeader title={t('delegate.title')} />

      <div className={styles.dataContent}>
        {renderAsync(
          mapAsync(
            (data) => ({ data: data.indexers?.nodes.filter(notEmpty), totalCount: data?.indexers?.totalCount }),
            indexers,
          ),
          {
            loading: () => <Spinner />,
            error: (error) => <Typography>{`Error: Failed to get Indexers: ${error.message}`}</Typography>,
            data: (data) => {
              if (!data || data?.totalCount === 0) {
                return <Typography>{`No Indexer available.`}</Typography>;
              }
              return <IndexerList indexers={data.data} totalCount={data.totalCount} onLoadMore={fetchMore} />;
            },
          },
        )}
      </div>
    </>
  );
};
