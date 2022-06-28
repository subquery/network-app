// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useParticipantChallenges, useWeb3 } from '../../../containers';
import { AppPageHeader } from '../../../components';
import styles from './Home.module.css';
import { Spinner } from '@subql/react-ui';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Missions, MissionsProps } from './Missions/Missions';
import { getCapitalizedStr, renderAsync } from '../../../utils';
import { CURR_SEASON, getMissionDetails, MISSION_TYPE, SEASONS } from '../constants';
import { useState } from 'react';
import { SeasonProgress } from '../../../components/SeasonProgress/SeasonProgress';
import { SeasonInfo } from '../../../components/SeasonInfo/SeasonInfo';
import { Typography } from 'antd';

interface PointListProps extends Partial<MissionsProps> {
  missionType: MISSION_TYPE;
  data: any; //TODO: data Type
}
const PointList: React.VFC<PointListProps> = ({ missionType, data, season, viewPrev, viewCurr }) => {
  const { t } = useTranslation();

  const dataSource = data[missionType];
  const totalPoint = data[missionType]['singleChallengePts'];

  if (!dataSource) {
    return <Typography.Title level={5}>There is no data available.</Typography.Title>;
  }

  return (
    <>
      {data[missionType]['singleChallengePts'] && (
        <div className={styles.totalPoints}>
          <Typography.Text type="secondary" className={styles.pointText}>
            {t('missions.totalPoint')}
          </Typography.Text>
          <Typography.Text className={styles.pointText}>{t('missions.point', { count: totalPoint })}</Typography.Text>
        </div>
      )}
      <div>
        <Missions
          participant={dataSource}
          missionDetails={getMissionDetails(missionType)}
          season={season ?? 3}
          viewPrev={viewPrev}
          viewCurr={viewCurr}
        />
      </div>
    </>
  );
};

const tabList = [MISSION_TYPE.INDEXER, MISSION_TYPE.DELEGATOR, MISSION_TYPE.CONSUMER];

export const Home: React.VFC = () => {
  const [curTab, setCurTab] = React.useState<MISSION_TYPE>(MISSION_TYPE.INDEXER);
  const { account } = useWeb3();
  const { t } = useTranslation();
  const [season, setSeason] = useState(CURR_SEASON);
  const participant = useParticipantChallenges(season, { indexerId: account ?? '' });

  const viewPrev = () => setSeason(season - 1);
  const viewCurr = () => setSeason(CURR_SEASON);

  return (
    <>
      <AppPageHeader title={t('header.missions')} />
      <SeasonProgress timePeriod={SEASONS[season]} />

      {renderAsync(participant, {
        loading: () => <Spinner />,
        error: (e) => <div>{`Unable to fetch Participant: ${e.message}`}</div>,
        data: (data: any) => {
          return (
            <>
              <div>
                <div className={styles.tabList}>
                  {tabList.map((tab) => {
                    if (tab === MISSION_TYPE.CONSUMER && season === 2) return undefined;
                    return (
                      <div key={tab} className={styles.tab} onClick={() => setCurTab(tab)}>
                        <Typography.Text className={`${styles.tabText} ${styles.grayText}`}>
                          {getCapitalizedStr(tab)}
                        </Typography.Text>
                        {curTab === tab && <div className={styles.line} />}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.container}>
                  <SeasonInfo season={season} viewPrev={viewPrev} viewCurr={viewCurr} />

                  <PointList missionType={curTab} data={data} season={season} viewPrev={viewPrev} viewCurr={viewCurr} />
                </div>
              </div>
            </>
          );
        },
      })}
    </>
  );
};
