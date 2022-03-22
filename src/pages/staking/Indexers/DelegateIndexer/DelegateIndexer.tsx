// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useHistory, useParams } from 'react-router';
import { CurEra } from '../../../../components';
import styles from './DelegateIndexer.module.css';
import { useTranslation } from 'react-i18next';
import { useIndexerCapacity, useSortedIndexer } from '../../../../hooks';
import { formatEther, mergeAsync, renderAsync } from '../../../../utils';
import { DoDelegate } from '../DoDelegate';
import { IndexingContent } from '../../Indexer/Indexing/IndexingContent';

type RouteParams = {
  address: string;
};

export const DelegateIndexer: React.VFC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { address } = useParams<RouteParams>();

  React.useEffect(() => {
    if (!address) {
      history.push('/staking/indexers');
    }
  }, [address, history]);

  const sortedIndexer = useSortedIndexer(address);
  const curCapacity = useIndexerCapacity(address);

  return (
    <>
      <div className={styles.header}>
        <Typography variant="h4" className={`${styles.title} ${styles.grayText}`}>
          {`${t('delegate.toIndexer')}  >  ${t('delegate.viewProfile')}`}
        </Typography>

        <CurEra />
      </div>

      <div className={styles.profile}>
        <div>{<Address address={address} size="large" />}</div>
        <DoDelegate indexerAddress={address} />
      </div>

      <div className={styles.indexing}>
        {renderAsync(mergeAsync(sortedIndexer, curCapacity), {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            if (!data) return <></>;
            const [sortedIndexing, curCapacity] = data;
            if (!sortedIndexing) return <></>;
            return (
              <IndexingContent
                tableData={[
                  {
                    ...sortedIndexing,
                    capacity: { current: formatEther(curCapacity?._hex) },
                  },
                ]}
                indexer={address}
              />
            );
          },
        })}
      </div>
    </>
  );
};
