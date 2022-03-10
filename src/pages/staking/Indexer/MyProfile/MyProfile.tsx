// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useWeb3 } from '../../../../containers';
import { useLocation } from 'react-router';
import { Card, CurEra, Sidebar } from '../../../../components';
import styles from './MyProfile.module.css';
import { useTranslation } from 'react-i18next';
import { Indexing } from '../Indexing/Indexing';
import Delegating from '../Delegating';
import { useSortedIndexer } from '../../../../hooks';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Rewards = 'Rewards',
  Locked = 'Locked',
}

export const MyProfile: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { loading, commission, totalStake, ownStake, totalDelegations, delegationList } = useSortedIndexer(
    account || '',
  );

  // TODO: Table component
  const tableData = {
    totalStake: totalStake,
    ownStake: ownStake,
    commission: commission,
    totalDelegations: totalDelegations,
  };

  const cards = [
    {
      category: t('indexer.indexing'),
      title: t('indexer.totalStakeAmount'),
      value: `${totalStake.current} SQT`,
    },
    {
      category: t('delegate.delegating'),
      title: t('delegate.totalDelegation'),
      value: `${totalStake.current} SQT`,
    },
  ];

  const tabList = [SectionTabs.Indexing, SectionTabs.Delegating, SectionTabs.Rewards, SectionTabs.Locked];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <Typography variant="h3" className={`${styles.title} ${styles.grayText}`}>
            {t('indexer.profile')}
          </Typography>

          <CurEra />
        </div>

        <div className={styles.profile}>
          {/* TODO CONNECT WALLET HINT */}
          {loading && <Spinner />}
          {!loading && totalStake && (
            <>
              <div>{<Address address={account ?? ''} size="large" />}</div>
              <div className={styles.stakingSummary}>
                {cards.map((card) => (
                  <Card category={card.category} title={card.title} value={card.value} key={card.category} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* TODO Button component */}
        <div>
          <div className={styles.tabList}>
            {tabList.map((tab) => (
              <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
                <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
                {curTab === tab && <div className={styles.line} />}
              </div>
            ))}
          </div>
          {curTab === SectionTabs.Indexing && <Indexing tableData={tableData} delegations={delegationList} />}
          {curTab === SectionTabs.Delegating && (
            <Delegating delegating={delegationList.filter((delegation) => delegation.indexer !== account)} />
          )}
        </div>
      </div>
    </div>
  );
};
