// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useParticipantChallenges, useWeb3 } from '../../../containers';
import { AppPageHeader } from '../../../components';
import styles from './Home.module.css';
import { Spinner } from '@subql/react-ui';
import { useTranslation } from 'react-i18next';
import { Missions, MissionsProps } from './Missions/Missions';
import { getCapitalizedStr } from '../../../utils';
import { CURR_SEASON, MISSION_TYPE, SEASONS } from '../constants';
import { useState } from 'react';
import { SeasonProgress } from '../../../components/SeasonProgress/SeasonProgress';
import { SeasonInfo } from '../../../components/SeasonInfo/SeasonInfo';
import { Typography } from 'antd';

// TODO: Move together with MissionTable
interface PointListProps extends Partial<MissionsProps> {
  missionType: MISSION_TYPE;
  data: any; //TODO: data Type
}

export const PointList: React.VFC<PointListProps> = ({ missionType, data, season, viewPrev, viewCurr }) => {
  const { t } = useTranslation();
  const dataSource = data[missionType];

  if (!dataSource) {
    return <Typography.Title level={5}>There is no data available.</Typography.Title>;
  }

  const totalPoint = dataSource['singleChallengePts'] ?? dataSource['totalPoints'] ?? undefined;
  const dailyChallenges = data[MISSION_TYPE.INDEXER] && data[MISSION_TYPE.INDEXER]['dailyChallenges']; // TODO: review the args of Missions

  return (
    <>
      {totalPoint !== undefined && (
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
          missionType={missionType}
          season={season ?? 3}
          dailyChallenges={dailyChallenges}
          viewPrev={viewPrev}
          viewCurr={viewCurr}
        />
      </div>
    </>
  );
};

export const tabList = [MISSION_TYPE.INDEXER, MISSION_TYPE.DELEGATOR, MISSION_TYPE.CONSUMER];

//TODO: add dataType for participate & indexer and move after refactor
//TODO: viewPrev, viewCurr not been used
interface TabContentProps {
  participant: any;
  indexer: any;
  seasonInfo?: boolean;
  season: number;
}
export const TabContent: React.VFC<TabContentProps> = ({ participant, indexer, seasonInfo, season }) => {
  const [curTab, setCurTab] = React.useState<MISSION_TYPE>(MISSION_TYPE.INDEXER);

  if (participant?.loading || indexer?.loading) {
    return <Spinner />;
  }

  // TODO: move under tabList
  if (!participant?.data || !indexer?.data) {
    return (
      <div className={styles.nonData}>
        <Typography.Title level={5}>There is no data available</Typography.Title>
      </div>
    );
  }

  const data = { ...participant.data, writable: true };

  const totalPoints = indexer?.data?.indexerS3Challenges?.totalPoints ?? 0;
  const singlePoints = indexer?.data?.indexerS3Challenges?.singlePoints ?? 0;
  const indexerSingleChallengePts = data?.indexer?.singleChallengePts ?? 0;
  const indexerTotal = totalPoints - singlePoints + indexerSingleChallengePts;

  data.indexer = { ...data.indexer, dailyChallenges: indexer?.data?.indexerS3Challenges?.challenges };
  data.indexer.singleChallengePts = indexerTotal;

  return (
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
        {seasonInfo && <SeasonInfo season={season} viewPrev={undefined} viewCurr={undefined} />}

        <PointList missionType={curTab} data={data} season={season} viewPrev={undefined} viewCurr={undefined} />
      </div>
    </div>
  );
};

export const Home: React.VFC = () => {
  const { account } = useWeb3();
  const { t } = useTranslation();
  const [season, setSeason] = useState(CURR_SEASON);
  const [participant, indexer] = useParticipantChallenges(season, { indexerId: account ?? '' });

  // const viewPrev = () => setSeason(season - 1);
  // const viewCurr = () => setSeason(CURR_SEASON);

  return (
    <>
      <AppPageHeader title={t('header.missions')} />
      <SeasonProgress timePeriod={SEASONS[season]} />

      <TabContent participant={participant} indexer={indexer} season={season} seasonInfo />
    </>
  );
};
