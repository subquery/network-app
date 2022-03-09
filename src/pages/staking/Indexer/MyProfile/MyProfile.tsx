// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useEra, useIndexer, useWeb3 } from '../../../../containers';
import { convertBigNumberToNumber, convertStringToNumber, formatEther } from '../../../../utils';
import { useLocation } from 'react-router';
import { Card, CurEra, Sidebar } from '../../../../components';
import styles from './MyProfile.module.css';
import { useTranslation } from 'react-i18next';
import { convertRawEraValue, RawEraValue, useEraValue } from '../../../../hooks/useEraValue';
import { Indexing } from '../Indexing/Indexing';
import Delegating from '../Delegating';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Rewards = 'Rewards',
  Locked = 'Locked',
}

export const MyProfile: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { account } = useWeb3();
  const { currentEra } = useEra();
  const indexerData = useIndexer({ address: account || '' });

  const { t } = useTranslation();

  const { loading: loadingIndexer, data: indexer } = indexerData;

  const commission = useEraValue(indexer?.indexer?.commission ?? null);
  const sortedCurCommission = convertBigNumberToNumber(commission?.current ?? 0);
  const sortedNextCommission = convertBigNumberToNumber(commission?.after ?? 0);
  const sortedCommission = { value: sortedCurCommission, valueAfter: sortedNextCommission };

  const totalStake = useEraValue(indexer?.indexer?.totalStake ?? null);
  const sortedCurTotalStake = formatEther(totalStake?.current ?? 0);
  const sortedAfterTotalStake = formatEther(totalStake?.after ?? 0);
  const sortedTotalStake = { value: sortedCurTotalStake, valueAfter: sortedAfterTotalStake };

  // TODO: refactor
  // TODO: confirm with design, whether show own delegate
  const delegations = indexer?.indexer?.delegations?.nodes ?? [];
  const sortedDelegationList = delegations.map((delegation) => {
    const delegator = delegation?.delegatorAddress;
    const indexer = delegation?.indexerAddress;
    const sortedDelegation = convertRawEraValue(delegation?.amount as RawEraValue);
    const value = formatEther(sortedDelegation.value);
    const valueAfter = formatEther(sortedDelegation.valueAfter);
    const era = sortedDelegation.era;
    if (currentEra.data?.index && currentEra.data?.index > era) {
      return { value: valueAfter, delegator, indexer };
    } else {
      return { value, valueAfter, delegator, indexer };
    }
  });

  const sortedTotalCurDelegation = sortedDelegationList.reduce((a, b) => {
    return a + convertStringToNumber(b.value);
  }, 0);

  const sortedTotalAfterDelegation = sortedDelegationList.reduce((a, b) => {
    return a + convertStringToNumber(b?.valueAfter ?? '0');
  }, 0);

  const sortedOwnStake = sortedDelegationList.filter((delegation) => delegation.delegator === account)[0];

  const sortedTotalDelegations = { value: sortedTotalCurDelegation, after: sortedTotalAfterDelegation };
  const tableData = {
    totalStake: sortedTotalStake,
    ownStake: sortedOwnStake,
    commission: sortedCommission,
    totalDelegations: sortedTotalDelegations,
  };

  const cards = [
    {
      category: t('indexer.indexing'),
      title: t('indexer.totalStakeAmount'),
      value: `${sortedCurTotalStake} SQT`,
    },
    {
      category: t('delegate.delegating'),
      title: t('delegate.totalDelegation'),
      value: `${sortedTotalCurDelegation} SQT`,
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
          {loadingIndexer && <Spinner />}
          {!loadingIndexer && indexer?.indexer && (
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
          {curTab === SectionTabs.Indexing && <Indexing tableData={tableData} delegations={sortedDelegationList} />}
          {curTab === SectionTabs.Delegating && (
            <Delegating delegating={sortedDelegationList.filter((delegation) => delegation.indexer !== account)} />
          )}
        </div>
      </div>
    </div>
  );
};
