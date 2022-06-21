// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
// import { useWeb3 } from '../../../../containers';
import { CurEra } from '../../../../components';
import styles from './Leaderboard.module.css';
import { useTranslation } from 'react-i18next';
import Ranks from '../Ranks';
import { CURR_SEASON, SEASONS } from '../../constants';
import { SeasonProgress } from '../../../../components/SeasonProgress/SeasonProgress';

enum SectionTabs {
  Indexing = 'Indexing',
  Delegating = 'Delegating',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing];

const Leaderboard: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { t } = useTranslation();
  const [season, setSeason] = React.useState(CURR_SEASON);

  const viewPrev = () => setSeason(season - 1);
  const viewCurr = () => setSeason(CURR_SEASON);

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.header}>{t('missions.leaderboard')}</div>
        <CurEra />
      </div>
      <br />
      <SeasonProgress timePeriod={SEASONS[season]} />
      <div>
        <div className={styles.tabList}>
          {tabList.map((tab) => (
            <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
              <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
              {curTab === tab && <div className={styles.line} />}
            </div>
          ))}
        </div>
        {curTab === SectionTabs.Indexing && <Ranks season={season} viewPrev={viewPrev} viewCurr={viewCurr} />}
      </div>
    </>
  );
};

export default Leaderboard;
