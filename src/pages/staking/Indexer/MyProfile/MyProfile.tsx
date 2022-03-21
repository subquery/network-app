// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useHistory } from 'react-router';
import { useWeb3 } from '../../../../containers';
import { Card, CurEra } from '../../../../components';
import styles from './MyProfile.module.css';
import { useTranslation } from 'react-i18next';
import { Indexing } from '../Indexing/Indexing';
import Delegating from '../Delegating';
import { useSortedIndexer, useUserDelegations } from '../../../../hooks';
import { convertStringToNumber, mergeAsync, renderAsync } from '../../../../utils';
import Rewards from '../Rewards/Rewards';
import { Locked } from '../../Locked/Home/Locked';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Rewards = 'Rewards',
  Locked = 'Locked',
}

const tabList = [SectionTabs.Indexing, SectionTabs.Delegating, SectionTabs.Rewards, SectionTabs.Locked];

export const MyProfile: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { t } = useTranslation();
  const { account } = useWeb3();
  const history = useHistory();
  const sortedIndexer = useSortedIndexer(account || '');
  const totalDelegations = useUserDelegations(account);

  React.useEffect(() => {
    if (!account) {
      history.push('/staking');
    }
    return;
  }, [account, history]);

  return (
    <>
      <div className={styles.header}>
        <Typography variant="h3" className={`${styles.title} ${styles.grayText}`}>
          {t('indexer.profile')}
        </Typography>

        <CurEra />
      </div>

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
                <div>{<Address address={account ?? ''} size="large" />}</div>
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
          {tabList.map((tab) => (
            <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
              <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
              {curTab === tab && <div className={styles.line} />}
            </div>
          ))}
        </div>
        {curTab === SectionTabs.Indexing && <Indexing tableData={sortedIndexer} indexer={account ?? ''} />}
        {curTab === SectionTabs.Delegating && <Delegating delegator={account ?? ''} />}
        {curTab === SectionTabs.Rewards && <Rewards delegatorAddress={account ?? ''} />}
        {curTab === SectionTabs.Locked && <Locked />}
      </div>
    </>
  );
};
