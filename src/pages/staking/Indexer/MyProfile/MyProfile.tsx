// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { Redirect, Route, Switch, useHistory } from 'react-router';
import { useWeb3 } from '../../../../containers';
import { Card, AppPageHeader, TabButtons } from '../../../../components';
import styles from './MyProfile.module.css';
import { useTranslation } from 'react-i18next';
import { Indexing } from '../Indexing/Indexing';
import Delegating from '../Delegating';
import { useSortedIndexer, useUserDelegations } from '../../../../hooks';
import { convertStringToNumber, fetchEns, mergeAsync, renderAsync } from '../../../../utils';
import Rewards from '../Rewards/Rewards';
import { Locked } from '../../Locked/Home/Locked';

const ROUTE = '/staking/my-profile';
const INDEXING = `${ROUTE}/indexing`;
const DELEGATING = `${ROUTE}/delegating`;
const REWARDS = `${ROUTE}/rewards`;
const LOCKED = `${ROUTE}/locked`;

const buttonLinks = [
  { label: 'Indexing', link: INDEXING },
  { label: 'Delegating', link: DELEGATING },
  { label: 'Rewards', link: REWARDS },
  { label: 'Locked', link: LOCKED },
];

export const MyProfile: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const history = useHistory();
  const sortedIndexer = useSortedIndexer(account || '');
  const totalDelegations = useUserDelegations(account);
  const [userId, setUserId] = React.useState<string>(account ?? '');

  React.useEffect(() => {
    if (!account) {
      history.push('/staking');
    } else {
      const loadEns = async (account: string) => {
        const ens = await fetchEns(account);
        if (ens) setUserId(ens);
      };

      loadEns(account);
    }
    return;
  }, [account, history]);

  return (
    <>
      <AppPageHeader title={t('indexer.profile')} />

      <div className={styles.profile}>
        {/* TODO CONNECT WALLET HINT */}
        {renderAsync(mergeAsync(sortedIndexer, totalDelegations), {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
          data: (data) => {
            if (!data) return null;
            const [s, d] = data;
            const totalDelegations = convertStringToNumber(d?.current ?? '0') - (s?.ownStake.current ?? 0);
            const cards = [
              {
                category: t('indexer.indexing'),
                title: t('indexer.totalStakeAmount'),
                value: `${s?.totalStake.current ?? 0} SQT`,
              },
              {
                category: t('delegate.delegating'),
                title: t('delegate.totalDelegation'),
                value: `${totalDelegations} SQT`,
              },
            ];
            return (
              <>
                <div>{<Address truncated={userId.length > 20} address={userId} size="large" />}</div>
                <div className={styles.stakingSummary}>
                  {cards.map((card) => (
                    <Card category={card.category} title={card.title} value={card.value} key={card.category} />
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

        <Switch>
          <Route
            exact
            path={INDEXING}
            component={() => <Indexing tableData={sortedIndexer} indexer={account ?? ''} />}
          />
          <Route exact path={DELEGATING} component={() => <Delegating delegator={account ?? ''} />} />
          <Route exact path={REWARDS} component={() => <Rewards delegatorAddress={account ?? ''} />} />
          <Route exact path={LOCKED} component={Locked} />
          <Redirect from={ROUTE} to={INDEXING} />
        </Switch>
      </div>
    </>
  );
};
