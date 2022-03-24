// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useIndexers } from '../../../../containers';
import { AppPageHeader } from '../../../../components';
import styles from './Indexers.module.css';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import { IndexerList } from '../IndexerList/IndexerList';

export const Indexers: React.VFC = () => {
  const indexers = useIndexers({});
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('delegate.title')} />

      <div className={styles.dataContent}>
        {renderAsyncArray(
          mapAsync((data) => data.indexers?.nodes.filter(notEmpty), indexers),
          {
            error: (e) => <Typography>{`Error: Fail to get Indexers ${e.message}`}</Typography>,
            loading: () => <Spinner />,
            empty: () => <Typography>No Indexers available.</Typography>,
            data: (data) => <IndexerList indexers={data} />,
          },
        )}
      </div>
    </>
  );
};
