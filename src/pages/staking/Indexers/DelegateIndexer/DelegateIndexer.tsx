// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Breadcrumb } from 'antd';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useNavigate, useParams } from 'react-router';
import { CurEra } from '../../../../components';
import styles from './DelegateIndexer.module.css';
import { useTranslation } from 'react-i18next';
import { useSortedIndexer } from '../../../../hooks';
import { renderAsync } from '../../../../utils';
import { DoDelegate } from '../DoDelegate';
import { IndexingContent } from '../../Indexer/Indexing/IndexingContent';
import { INDEXERS } from '../..';

type RouteParams = {
  address: string;
};

export const DelegateIndexer: React.VFC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { address } = useParams<RouteParams>();

  React.useEffect(() => {
    if (!address) {
      navigate(INDEXERS);
    }
  }, [address, navigate]);

  const sortedIndexer = useSortedIndexer(address ?? '');

  return (
    <>
      <div className={styles.header}>
        <Breadcrumb separator=">">
          <Breadcrumb.Item href={INDEXERS} className={styles.title}>
            {t('indexer.indexers')}
          </Breadcrumb.Item>
          <Breadcrumb.Item className={styles.title}>{t('delegate.viewProfile')}</Breadcrumb.Item>
        </Breadcrumb>

        <CurEra />
      </div>

      <div className={styles.profile}>
        <div>{<Address address={address ?? ''} size="large" />}</div>
        <DoDelegate indexerAddress={address ?? ''} />
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
                indexer={address ?? ''}
              />
            );
          },
        })}
      </div>
    </>
  );
};
