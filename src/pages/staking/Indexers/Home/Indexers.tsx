// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useIndexers } from '../../../../containers';
import { AppPageHeader } from '../../../../components';
import styles from './Indexers.module.css';
import { mapAsync, notEmpty } from '../../../../utils';
import { IndexerList } from '../IndexerList/IndexerList';

export const Indexers: React.VFC = () => {
  const indexers = useIndexers({});
  const { t } = useTranslation();

  const data = mapAsync((data) => data.indexers?.nodes.filter(notEmpty), indexers);

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
        {data.error ? (
          <Typography>{`Error: Fail to get Indexers ${data.error.message}`}</Typography>
        ) : (
          <IndexerList
            indexers={data?.data}
            totalCount={indexers.data?.indexers?.totalCount}
            onLoadMore={fetchMore}
            loading={data.loading}
          />
        )}
      </div>
    </>
  );
};
