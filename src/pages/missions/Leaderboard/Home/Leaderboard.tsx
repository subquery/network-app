// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Spinner, Typography } from '@subql/react-ui';
import { useHistory } from 'react-router';
import { useWeb3 } from '../../../../containers';
import { Card, CurEra } from '../../../../components';
import styles from './Leaderboard.module.css';
import { useTranslation } from 'react-i18next';
import { useSortedIndexer, useUserDelegations } from '../../../../hooks';
import { convertStringToNumber, mergeAsync, renderAsync } from '../../../../utils';
import Delegating from '../../../staking/Indexer/Delegating';
import Indexers from '../Ranks/Indexing/Indexers';
import Rewards from '../../../staking/Indexer/Rewards/Rewards';
import { Season } from '../../../../components/Season';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing, SectionTabs.Delegating, SectionTabs.Consumer];

export const Leaderboard: React.VFC = () => {
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
        <Typography variant="h2" className={`${styles.title} ${styles.grayText}`}>
          {t('missions.leaderboard')}
        </Typography>
        <CurEra />
      </div>

      {/* TODO:
            - this can be a single progress component which I can use for both Missions and 
        */}
      <Season />

      <div>
        <div className={styles.tabList}>
          {tabList.map((tab) => (
            <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
              <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
              {curTab === tab && <div className={styles.line} />}
            </div>
          ))}
        </div>
        {curTab === SectionTabs.Indexing && <Indexers delegatorAddress={'d'} />}
        {curTab === SectionTabs.Delegating && <Delegating delegator={account ?? ''} />}
        {curTab === SectionTabs.Consumer && <Rewards delegatorAddress={account ?? ''} />}
      </div>
    </>
  );
};
