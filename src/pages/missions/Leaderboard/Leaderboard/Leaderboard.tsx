// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
// import { useWeb3 } from '../../../../containers';
import { CurEra } from '../../../../components';
import styles from './Leaderboard.module.css';
import { useTranslation } from 'react-i18next';
import Ranks from '../Ranks';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing];

const Leaderboard: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { t } = useTranslation();
  // const { account } = useWeb3();
  // const history = useHistory();

  // const sortedIndexer = useSortedIndexer(account || '');
  // const totalDelegations = useUserDelegations(account);

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
      </div>
    </>
  );
};

export default Leaderboard;
