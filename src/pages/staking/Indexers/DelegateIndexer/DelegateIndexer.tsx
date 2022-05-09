// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { AiOutlineRight } from 'react-icons/ai';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useHistory, useParams } from 'react-router';
import { CurEra } from '../../../../components';
import styles from './DelegateIndexer.module.css';
import { useTranslation } from 'react-i18next';
import { useSortedIndexer } from '../../../../hooks';
import { renderAsync } from '../../../../utils';
import { DoDelegate } from '../DoDelegate';
import { IndexingContent } from '../../Indexer/Indexing/IndexingContent';
import { Link } from 'react-router-dom';

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

  return (
    <>
      <div className={styles.header}>
        <Typography variant="h4" className={`${styles.title} ${styles.grayText}`}>
          <Link to={'/staking/indexers'} className={styles.grayText}>
            {t('indexer.indexers')}
          </Link>
          <AiOutlineRight className={styles.rightIcon} /> {t('delegate.viewProfile')}
        </Typography>

        <CurEra />
      </div>

      <div className={styles.profile}>
        <div>{<Address address={address} size="large" />}</div>
        <DoDelegate indexerAddress={address} />
      </div>

      <div className={styles.indexing}>
        {renderAsync(sortedIndexer, {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            if (!data) return <></>;
            return (
              <IndexingContent
                tableData={[
                  {
                    ...data,
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
