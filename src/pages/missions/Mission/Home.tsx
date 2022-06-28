// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useParticipant, useParticipantChallenges, useWeb3 } from '../../../containers';
import { CurEra } from '../../../components';
import styles from './Home.module.css';
import { Spinner, Typography } from '@subql/react-ui';
import { useTranslation } from 'react-i18next';
import { Missions } from './Missions/Missions';
import { renderAsync } from '../../../utils';
import { CURR_SEASON, getMissionDetails, SEASONS } from '../constants';
import { useState } from 'react';
import { SeasonProgress } from '../../../components/SeasonProgress/SeasonProgress';
import { SeasonInfo } from '../../../components/SeasonInfo/SeasonInfo';

enum SectionTabs {
  Indexing = 'Indexer',
  Delegating = 'Delegator',
  Consumer = 'Consumer',
}

const tabList = [SectionTabs.Indexing, SectionTabs.Delegating, SectionTabs.Consumer];

export const Home: React.VFC = (children) => {
  const [curTab, setCurTab] = React.useState<SectionTabs>(SectionTabs.Indexing);
  const { account } = useWeb3();
  const { t } = useTranslation();
  const [season, setSeason] = useState(CURR_SEASON);
  const participant = useParticipantChallenges(season, { indexerId: account ?? '' });
  const indexer = useParticipant(season, { indexerId: account ?? '' });

  const viewPrev = () => setSeason(season - 1);
  const viewCurr = () => setSeason(CURR_SEASON);

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.header}>{t('header.missions')}</div>
        <CurEra />
      </div>
      <br />
      {renderAsync(indexer, {
        loading: () => <Spinner />,
        error: (e) => <div>{`Unable to fetch Indexer: ${e.message}`}</div>,
        data: (data: any) => {
          return (
            <>
              <div className={styles.profile}>
                <div className={styles.pointsSummary}>
                  <h3>Total Points</h3>
                  <h1>
                    <b>{data?.indexerS3Challenge?.singlePoints} points</b>
                  </h1>
                </div>
                <SeasonProgress timePeriod={SEASONS[season]} />
              </div>
            </>
          );
        },
      })}
      {renderAsync(participant, {
        loading: () => <Spinner />,
        error: (e) => <div>{`Unable to fetch Participant: ${e.message}`}</div>,
        data: (data: any) => {
          return (
            <>
              <div>
                <div className={styles.tabList}>
                  {tabList.map((tab) => {
                    if (tab === SectionTabs.Consumer && season === 2) return undefined;
                    return (
                      <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
                        <Typography className={`${styles.tabText} ${styles.grayText}`}>{tab}</Typography>
                        {curTab === tab && <div className={styles.line} />}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.container}>
                  <SeasonInfo season={season} viewPrev={viewPrev} viewCurr={viewCurr} />
                </div>
                {curTab === SectionTabs.Indexing && (
                  <Missions
                    participant={data.indexer}
                    missionDetails={getMissionDetails('Indexer')}
                    season={season}
                    viewPrev={viewPrev}
                    viewCurr={viewCurr}
                  />
                )}
                {curTab === SectionTabs.Delegating && (
                  <Missions
                    participant={data.delegator}
                    missionDetails={getMissionDetails('Delegator')}
                    season={season}
                    viewPrev={viewPrev}
                    viewCurr={viewCurr}
                  />
                )}
                {curTab === SectionTabs.Consumer && (
                  <Missions
                    participant={data.consumer}
                    missionDetails={getMissionDetails('Consumer')}
                    season={season}
                    viewPrev={viewPrev}
                    viewCurr={viewCurr}
                  />
                )}
              </div>
            </>
          );
        },
      })}
    </>
  );
};
