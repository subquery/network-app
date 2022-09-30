// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import styles from './Indexing.module.css';
import { useTranslation } from 'react-i18next';
import { DoStake } from '../DoStake';
import { mergeAsync, renderAsyncArray } from '../../../../utils';
import { useIsIndexer, useSortedIndexer } from '../../../../hooks';
import { IndexingContent } from './IndexingContent';

export const NotRegisteredIndexer: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography>{t('indexer.notRegister')}</Typography>
      <div className={styles.learnMoreContainer}>
        <Typography className={styles.learnMoreText}>{t('indexer.learnMore')}</Typography>
        <a href="https://doc.subquery.network/" target="blank" className={styles.learnMoreBtn}>
          {t('indexer.here')}
        </a>
      </div>
    </>
  );
};

interface Props {
  tableData: ReturnType<typeof useSortedIndexer>;
  indexer: string;
}

export const Indexing: React.VFC<Props> = ({ tableData, indexer }) => {
  const { t } = useTranslation();
  const isIndexer = useIsIndexer(indexer);

  return (
    <div className={'contentContainer'}>
      {renderAsyncArray(mergeAsync(isIndexer, tableData), {
        loading: () => <Spinner />,
        empty: () => <Typography>{`No data available`}</Typography>,
        error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
        data: (data) => {
          if (!data) return <></>;
          const [isIndexer, sortedIndexing] = data;
          if (isIndexer === undefined) return <Spinner />;
          if (!isIndexer && !sortedIndexing) return <NotRegisteredIndexer />;
          if (!sortedIndexing)
            return (
              <>
                <Typography className={styles.grayText}>{t('indexer.doStake')}</Typography>
                <div className={styles.btns}>
                  <DoStake />
                </div>
              </>
            );
          return (
            <IndexingContent
              tableData={[
                {
                  ...sortedIndexing,
                },
              ]}
              indexer={indexer}
            />
          );
        },
      })}
    </div>
  );
};
