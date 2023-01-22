// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import { useWeb3 } from '../../../../containers';
import { Card, AppPageHeader, TabButtons } from '../../../../components';
import styles from './MyProfile.module.css';
import { useTranslation } from 'react-i18next';
import { Indexing } from '../Indexing/Indexing';
import Delegating from '../Delegating';
import { useSortedIndexer, useUserDelegations } from '../../../../hooks';
import { formatEther, mergeAsync, renderAsync, ROUTES, TOKEN, truncFormatEtherStr } from '../../../../utils';
import Rewards from '../Rewards/Rewards';
import { Locked } from '../../Locked/Home/Locked';
import { useENS } from '../../../../hooks/useEns';
import { parseEther } from 'ethers/lib/utils';

const { INDEXING, DELEGATING, REWARDS, LOCKED } = ROUTES;

const buttonLinks = [
  { label: 'Indexing', link: INDEXING },
  { label: 'Delegating', link: DELEGATING },
  { label: 'Rewards', link: REWARDS },
  { label: 'Locked', link: LOCKED },
];

export const MyProfile: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const navigate = useNavigate();
  const sortedIndexer = useSortedIndexer(account || '');
  const totalDelegations = useUserDelegations(account);
  const ens = useENS(account || '');
  const userId = ens.data ?? account ?? '';

  React.useEffect(() => {
    if (!account) {
      navigate(ROUTES.STAKING);
    }
    return;
  }, [account, navigate]);

  return (
    <>
      <AppPageHeader title={t('indexer.profile')} />

      <div className={styles.profile}>
        {renderAsync(mergeAsync(sortedIndexer, totalDelegations), {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            if (!data) return null;
            const [s, d] = data;
            const sortedTotalStaking = truncFormatEtherStr(`${s?.totalStake.current ?? 0}`);
            const sortedTotalDelegations = formatEther(
              parseEther(d?.current ?? '0').sub(parseEther(`${s?.ownStake.current ?? 0}`)),
              4,
            );

            const cards = [
              {
                title: t('indexer.stakingAmountTitle'),
                value: `${sortedTotalStaking} ${TOKEN}`,
              },
              {
                title: t('delegate.delegationAmountTitle'),
                value: `${sortedTotalDelegations} ${TOKEN}`,
              },
            ];
            return (
              <>
                <div>{<Address truncated={userId.length > 20} address={userId} size="large" />}</div>
                <div className={styles.stakingSummary}>
                  {cards.map((card) => (
                    <Card title={card.title} value={card.value} key={card.title} />
                  ))}
                </div>
              </>
            );
          },
        })}
      </div>

      <div>
        <div className={styles.tabList}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>

        <Routes>
          <Route path={INDEXING} element={<Indexing tableData={sortedIndexer} indexer={account ?? ''} />} />
          <Route path={DELEGATING} element={<Delegating delegator={account ?? ''} />} />
          <Route path={REWARDS} element={<Rewards delegatorAddress={account ?? ''} />} />
          <Route path={LOCKED} element={<Locked />} />
          <Route path={'/'} element={<Navigate replace to={INDEXING} />} />
        </Routes>
      </div>
    </>
  );
};
