// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useWeb3 } from '../../../../containers';
import { Card, CurEra, Sidebar } from '../../../../components';
import styles from './MyProfile.module.css';
import { useTranslation } from 'react-i18next';
import { Indexing } from '../Indexing/Indexing';
import Delegating from '../Delegating';
import { useSortedIndexer } from '../../../../hooks';
import { Locked } from '../../Locked/Home/Locked';
import { AsyncData, mergeAsync, renderAsync } from '../../../../utils';
import { CurrentEraValue } from '../../../../hooks/useEraValue';

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
  const sortedIndexer = useSortedIndexer(account || '');

  /* Placeholder for contracts update */
  const totalDelegations: AsyncData<CurrentEraValue<number>> = { loading: false, data: { current: 0, after: 0 } }; //useUserDelegations(account);

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
          {renderAsync(mergeAsync(sortedIndexer, totalDelegations), {
            loading: () => <Spinner />,
            error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
            data: (data) => {
              if (!data) return null;
              const [s, d] = data;
              const cards = [
                {
                  category: t('indexer.indexing'),
                  title: t('indexer.totalStakeAmount'),
                  value: `${s?.totalStake.current} SQT`,
                },
                {
                  category: t('delegate.delegating'),
                  title: t('delegate.totalDelegation'),
                  value: `${d?.current} SQT`,
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
          {curTab === SectionTabs.Indexing && <Indexing tableData={sortedIndexer} indexer={account ?? ''} />}
          {curTab === SectionTabs.Delegating && <Delegating delegator={account ?? ''} />}
          {curTab === SectionTabs.Locked && <Locked />}
        </div>
      </div>
    </div>
  );
};
