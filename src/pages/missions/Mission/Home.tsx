// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useS3DailyChallenges, useWeb3 } from '../../../containers';
import { AppPageHeader, TabButtons } from '../../../components';
import styles from './Home.module.css';
import { Spinner } from '@subql/react-ui';
import { useTranslation } from 'react-i18next';
import { getCapitalizedStr } from '../../../utils';
import { CURR_SEASON, PARTICIPANT, SEASONS } from '../constants';
import { useState } from 'react';
import { SeasonProgress } from '../../../components/SeasonProgress/SeasonProgress';
import { SeasonInfo } from '../../../components/SeasonInfo/SeasonInfo';
import { MissionTable } from './MissionTable/MissionTable';
import { Redirect, Route, Switch } from 'react-router';
import {
  useS3ConsumerChallenges,
  useS3DelegatorChallenges,
  useS3IndexerChallenges,
} from '../../../containers/QuerySeason3Project';
// import { useS3ConsumerPoints, useS3DelegatorPoints } from '../../../containers/QuerySeason3Project';

export const tabList = [PARTICIPANT.INDEXER, PARTICIPANT.DELEGATOR, PARTICIPANT.CONSUMER];

export const MISSION_ROUTE = `/missions/my-missions`;
const INDEXER_PARTICIPANT = `${MISSION_ROUTE}/indexer`;
const DELEGATOR_PARTICIPANT = `${MISSION_ROUTE}/delegator`;
const CONSUMER_PARTICIPANT = `${MISSION_ROUTE}/consumer`;

const buttonLinks = [
  { label: getCapitalizedStr(PARTICIPANT.INDEXER), link: INDEXER_PARTICIPANT },
  { label: getCapitalizedStr(PARTICIPANT.DELEGATOR), link: DELEGATOR_PARTICIPANT },
  { label: getCapitalizedStr(PARTICIPANT.CONSUMER), link: CONSUMER_PARTICIPANT },
];

//TODO: add dataType for participate & indexer and refactor data extraction
//TODO: viewPrev, viewCurr not been used
interface TabContentProps {
  participant?: PARTICIPANT;
  completedMissions: any;
  indexer: any;
  seasonInfo?: boolean;
  season: number;
}
export const TabContent: React.VFC<TabContentProps> = ({
  participant = PARTICIPANT.INDEXER,
  completedMissions,
  indexer,
  seasonInfo,
  season,
}) => {
  const isLoading = completedMissions?.loading || indexer?.loading;

  const data = { ...completedMissions.data };

  const totalPoints = indexer?.data?.indexerS3Challenges?.totalPoints ?? 0;
  const singlePoints = indexer?.data?.indexerS3Challenges?.singlePoints ?? 0;
  const indexerSingleChallengePts = data?.indexer?.singleChallengePts ?? 0;
  const indexerTotal = totalPoints - singlePoints + indexerSingleChallengePts;

  data.indexer = { ...data.indexer, dailyChallenges: indexer?.data?.indexerS3Challenges?.challenges };
  data.indexer.singleChallengePts = indexerTotal;

  const sortedData = data[participant] || [];
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
            participant={participant}
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
    <div className={styles.container}>
      <MainContent />
    </div>
  );
};

interface MissionsProps {
  account: string;
  queryChallengesFn: typeof useS3IndexerChallenges | typeof useS3ConsumerChallenges | typeof useS3DelegatorChallenges;
}

const Missions = ({ account, queryChallengesFn }: MissionsProps) => {
  const challenges = queryChallengesFn({ account });
  console.log('challenges', challenges);

  return <div>{'missions'}</div>;
};

interface IndexerMissionsProps extends MissionsProps {
  queryDailyChallengesFn: typeof useS3DailyChallenges;
}

const IndexerMissions = ({ account, queryChallengesFn, queryDailyChallengesFn }: IndexerMissionsProps) => {
  const challenges = queryChallengesFn({ account });
  const dailyChallenges = queryDailyChallengesFn({ account });
  console.log('challenges', challenges);
  console.log('dailyChallenges', dailyChallenges);

  return <div>{'IndexerMissions'}</div>;
};

//TODO: make data fetch separately
export const Home: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const [season, setSeason] = useState(CURR_SEASON);
  // const [completedMissions, indexer] = useParticipantChallenges(season, { indexerId: account ?? '' });

  // ISSUE: CAN NOT GET Incomplete chanllenge to display, review the whole code
  // const consumer = useS3ConsumerChallenges({ account: account ?? '' });
  // const delegator = useS3DelegatorPoints({ account: account ?? '' });

  // const viewPrev = () => setSeason(season - 1);
  // const viewCurr = () => setSeason(CURR_SEASON);

  const SortedTableContent = ({ participant }: { participant: PARTICIPANT }) => {
    return (
      <TabContent
        completedMissions={[]} //completedMissions
        indexer={[]} //indexer
        participant={participant}
        season={season}
        seasonInfo
      />
    );
  };

  return (
    <>
      <AppPageHeader title={t('header.missions')} />
      <SeasonProgress timePeriod={SEASONS[season]} />

      <div className={styles.tabList}>
        <TabButtons tabs={buttonLinks} whiteTab />
      </div>

      <Switch>
        <Route
          exact
          path={INDEXER_PARTICIPANT}
          // component={() => <SortedTableContent participant={PARTICIPANT.INDEXER} />}
          component={() => (
            <IndexerMissions
              account={account ?? ''}
              queryChallengesFn={useS3IndexerChallenges}
              queryDailyChallengesFn={useS3DailyChallenges}
            />
          )}
        />
        <Route
          exact
          path={DELEGATOR_PARTICIPANT}
          // component={() => <SortedTableContent participant={PARTICIPANT.DELEGATOR} />}
          component={() => <Missions account={account ?? ''} queryChallengesFn={useS3DelegatorChallenges} />}
        />
        <Route
          exact
          path={CONSUMER_PARTICIPANT}
          // component={() => <SortedTableContent participant={PARTICIPANT.CONSUMER} />}
          component={() => <Missions account={account ?? ''} queryChallengesFn={useS3ConsumerChallenges} />}
        />
        <Redirect from={MISSION_ROUTE} to={INDEXER_PARTICIPANT} />
      </Switch>
    </>
  );
};
