// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Spinner, Typography } from '@subql/react-ui';
import { useNavigate } from 'react-router';
import { useWeb3 } from '../../../containers';
import { Card, AppPageHeader } from '../../../components';
import styles from './MyStaking.module.css';
import { useTranslation } from 'react-i18next';
import { useIsIndexer, useSortedIndexer } from '../../../hooks';
import { mergeAsync, renderAsync, ROUTES, TOKEN, truncFormatEtherStr } from '../../../utils';
import { Indexing, NotRegisteredIndexer } from './Indexing';

// TODO: mergeAsync issue with array loading
export const MyStaking: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const navigate = useNavigate();
  const isIndexer = useIsIndexer(account);
  const sortedIndexer = useSortedIndexer(account || '');

  React.useEffect(() => {
    if (!account) {
      navigate(ROUTES.STAKING);
    }
    return;
  }, [account, navigate]);

  return (
    <>
      <AppPageHeader title={t('indexer.myStaking')} desc={t('indexer.myStakingDesc')} />

      <div className={styles.profile}>
        {renderAsync(mergeAsync(sortedIndexer, isIndexer), {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            if (!data) return null;
            const [s, indexer] = data;

            if (indexer === undefined && !s) return <Spinner />;
            if (!isIndexer && !s) return <NotRegisteredIndexer />;

            const sortedTotalStaking = truncFormatEtherStr(`${s?.totalStake.current ?? 0}`);

            return (
              <>
                <div className={styles.stakingAmount}>
                  <Card title={t('indexer.stakingAmountTitle')} value={`${sortedTotalStaking} ${TOKEN}`} />
                </div>
                <Indexing tableData={sortedIndexer} indexer={account ?? ''} />
              </>
            );
          },
        })}
      </div>
    </>
  );
};
