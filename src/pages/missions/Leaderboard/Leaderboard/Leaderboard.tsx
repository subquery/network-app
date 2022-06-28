// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import { CurEra } from '../../../../components';
import styles from './Leaderboard.module.css';
import { useTranslation } from 'react-i18next';
import Ranks from '../Ranks';
import { CURR_SEASON, SEASONS } from '../../constants';
import { SeasonProgress } from '../../../../components/SeasonProgress/SeasonProgress';
import { useParticipants } from '../../../../containers';

enum SectionTabs {
  Challenges = 'Challenges',
}

const tabList = [SectionTabs.Challenges];

export const Leaderboard: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Challenges);
  const { t } = useTranslation();
  const [season, setSeason] = React.useState(CURR_SEASON);
  const participants = useParticipants(season);

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
        {curTab === SectionTabs.Challenges && (
          <Ranks season={season} ranks={participants} viewPrev={viewPrev} viewCurr={viewCurr} />
        )}
      </div>
    </>
  );
};
