// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useParticipantChallenges, useWeb3 } from '../../../containers';
import { AppPageHeader } from '../../../components';
import styles from './Home.module.css';
import { Spinner } from '@subql/react-ui';
import { useTranslation } from 'react-i18next';
import { getCapitalizedStr } from '../../../utils';
import { CURR_SEASON, PARTICIPANT, SEASONS } from '../constants';
import { useState } from 'react';
import { SeasonProgress } from '../../../components/SeasonProgress/SeasonProgress';
import { SeasonInfo } from '../../../components/SeasonInfo/SeasonInfo';
import { Typography } from 'antd';
import { MissionTable } from './MissionTable/MissionTable';

export const tabList = [PARTICIPANT.INDEXER, PARTICIPANT.DELEGATOR, PARTICIPANT.CONSUMER];

//TODO: add dataType for participate & indexer and move after refactor
//TODO: viewPrev, viewCurr not been used
//TODO: use tabButton content
interface TabContentProps {
  participant: any;
  indexer: any;
  seasonInfo?: boolean;
  season: number;
}
export const TabContent: React.VFC<TabContentProps> = ({ participant, indexer, seasonInfo, season }) => {
  const [curTab, setCurTab] = React.useState<PARTICIPANT>(PARTICIPANT.INDEXER);

  const TabHeader: React.FC = () => {
    return (
      <div className={styles.tabList}>
        {tabList.map((tab) => {
          if (tab === PARTICIPANT.CONSUMER && season === 2) return undefined;
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
    );
  };

  const isLoading = participant?.loading || indexer?.loading;

  const data = { ...participant.data, writable: true };

  const totalPoints = indexer?.data?.indexerS3Challenges?.totalPoints ?? 0;
  const singlePoints = indexer?.data?.indexerS3Challenges?.singlePoints ?? 0;
  const indexerSingleChallengePts = data?.indexer?.singleChallengePts ?? 0;
  const indexerTotal = totalPoints - singlePoints + indexerSingleChallengePts;

  data.indexer = { ...data.indexer, dailyChallenges: indexer?.data?.indexerS3Challenges?.challenges };
  data.indexer.singleChallengePts = indexerTotal;

  const sortedData = data[curTab] || [];
  const dailyChallenges = data[PARTICIPANT.INDEXER].dailyChallenges;

  const MainContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    return (
      <>
        {seasonInfo && <SeasonInfo season={season} viewPrev={undefined} viewCurr={undefined} />}
        {sortedData && (
          <MissionTable
            participant={curTab}
            challenges={sortedData}
            dailyChallenges={dailyChallenges}
            season={season}
            viewPrev={undefined}
            viewCurr={undefined}
          />
        )}
      </>
    );
  };

  return (
    <>
      <TabHeader />
      <div className={styles.container}>
        <MainContent />
      </div>
    </>
  );
};

export const Home: React.VFC = () => {
  const { account } = useWeb3();
  const { t } = useTranslation();
  const [season, setSeason] = useState(CURR_SEASON);
  const [participant, indexer] = useParticipantChallenges(season, { indexerId: account ?? '' });

  // ISSUE: CAN NOT GET Incomplete chanllenge to display, review the whole code
  // const consumer = useConsumerPoints({ account: account ?? '' });
  // const delegator = useDelegatorPoints({ account: account ?? '' });

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
