// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
// import { useHistory } from 'react-router';
// import { useWeb3 } from '../../../../containers';
import { CurEra } from '../../../../components';
import styles from './Leaderboard.module.css';
import { useTranslation } from 'react-i18next';
// import { useSortedIndexer, useUserDelegations } from '../../../../hooks';
import Ranks from '../Ranks';
// import { Season } from '../../../../components/Season';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing, SectionTabs.Delegating, SectionTabs.Consumer];

const Leaderboard: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { t } = useTranslation();
  // const { account } = useWeb3();
  // const history = useHistory();

  // const sortedIndexer = useSortedIndexer(account || '');
  // const totalDelegations = useUserDelegations(account);

  // React.useEffect(() => {
  //   if (!account) {
  //     history.push('/missions/leaderboard');
  //   }
  //   return;
  // }, [account, history]);

  const seasons = {
    1: { from: new Date(2022, 4, 11), to: new Date(2022, 4, 20) },
    2: { from: new Date(2022, 4, 24), to: new Date(2022, 5, 1) },
    3: { from: new Date(2022, 5, 5), to: new Date(2022, 5, 15) },
  };

  // const seasonNum = 1;

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.header}>{t('missions.leaderboard')}</div>
        <CurEra />
      </div>

      {/* TODO:
            - this can be a single progress component which I can use for both Missions and 
        */}
      {/* <Season /> */}

      <div>
        <div className={styles.tabList}>
          {tabList.map((tab) => (
            <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
              <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
              {curTab === tab && <div className={styles.line} />}
            </div>
          ))}
        </div>
        {curTab === SectionTabs.Indexing && <Ranks seasons={seasons} />}
        {curTab === SectionTabs.Delegating && (
          <div className={styles.container}>
            <h2>Coming Soon</h2>
          </div>
        )}
        {curTab === SectionTabs.Consumer && (
          <div className={styles.container}>
            <h2>Coming Soon</h2>
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
