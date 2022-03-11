// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useEra, useIndexerDelegators, useWeb3 } from '../../../../containers';
import { Card, CurEra, Sidebar } from '../../../../components';
import styles from './MyProfile.module.css';
import { useTranslation } from 'react-i18next';
import { Indexing } from '../Indexing/Indexing';
import Delegating from '../Delegating';
import { useSortedIndexer } from '../../../../hooks';
import { convertStringToNumber, mapAsync, mergeAsync, renderAsync } from '../../../../utils';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
import { formatEther } from '@ethersproject/units';

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
  const indexerDelegations = useIndexerDelegators({ id: account ?? '' });
  const { currentEra } = useEra();

  const delegationList = mapAsync(
    ([indexer, era]) =>
      indexer?.indexer?.delegations.nodes.map((delegation) => ({
        value: mapEraValue(parseRawEraValue(delegation?.amount as RawEraValue, era?.index), (v) =>
          convertStringToNumber(formatEther(v ?? 0)),
        ),
        indexer: account ?? '',
        delegator: delegation?.delegatorAddress ?? '',
      })),
    mergeAsync(indexerDelegations, currentEra),
  );

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
          {renderAsync(sortedIndexer, {
            loading: () => <Spinner />,
            error: (e) => <Typography>{`Failed to load indexer information: ${e}`}</Typography>,
            data: (data) => {
              if (!data) return <Typography>User is not an indexer</Typography>;
              const { totalStake, totalDelegations } = data;
              const cards = [
                {
                  category: t('indexer.indexing'),
                  title: t('indexer.totalStakeAmount'),
                  value: `${totalStake.current} SQT`,
                },
                {
                  category: t('delegate.delegating'),
                  title: t('delegate.totalDelegation'),
                  value: `${totalDelegations.current} SQT`,
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
          {curTab === SectionTabs.Indexing && <Indexing tableData={sortedIndexer} delegations={delegationList} />}
          {curTab === SectionTabs.Delegating &&
            renderAsync(delegationList, {
              loading: () => <Spinner />,
              error: (e) => <Typography>{`Failed to load delegations: ${e}`}</Typography>,
              data: (data) =>
                data ? <Delegating delegating={data.filter((delegation) => delegation.indexer !== account)} /> : null,
            })}
        </div>
      </div>
    </div>
  );
};
