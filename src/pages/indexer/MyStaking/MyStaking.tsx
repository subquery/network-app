// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AppPageHeader, Card, Description } from '@components';
import { useWeb3 } from '@containers';
import { useIsIndexer, useSortedIndexer } from '@hooks';
import { Spinner, Typography } from '@subql/components';
import { mergeAsync, renderAsync, ROUTES, TOKEN, truncFormatEtherStr } from '@utils';

import { DoStake } from './DoStake';
import { Indexing, NotRegisteredIndexer } from './Indexing';
import styles from './MyStaking.module.css';
import { SetCommissionRate } from './SetCommissionRate';

export const MyStaking: React.FC = () => {
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
      <AppPageHeader title={t('indexer.myStaking')} />

      <div className={styles.profile}>
        {renderAsync(mergeAsync(sortedIndexer, isIndexer), {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            if (!data) return null;
            const [s, indexer] = data;

            if (indexer === undefined && !s) return <Spinner />;
            if (!indexer && !s) return <NotRegisteredIndexer />;

            const sortedTotalStaking = truncFormatEtherStr(`${s?.ownStake.current ?? 0}`);

            return (
              <>
                <Description desc={t('indexer.myStakingDesc')} />
                <div className={styles.stakingHeader}>
                  <div className={styles.stakingAmount}>
                    <Card title={t('indexer.stakingAmountTitle')} value={`${sortedTotalStaking} ${TOKEN}`} />
                  </div>
                  {s && (
                    <div className={styles.stakingActions}>
                      <DoStake />
                      <SetCommissionRate />
                    </div>
                  )}
                </div>

                <Indexing tableData={s} />
              </>
            );
          },
        })}
      </div>
    </>
  );
};
