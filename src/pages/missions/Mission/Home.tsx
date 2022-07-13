// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from 'antd';
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
import { renderAsync } from '../../../utils';

export const MISSION_ROUTE = `/missions/my-missions`;
const INDEXER_PARTICIPANT = `${MISSION_ROUTE}/indexer`;
const DELEGATOR_PARTICIPANT = `${MISSION_ROUTE}/delegator`;
const CONSUMER_PARTICIPANT = `${MISSION_ROUTE}/consumer`;

const buttonLinks = [
  { label: getCapitalizedStr(PARTICIPANT.INDEXER), link: INDEXER_PARTICIPANT },
  { label: getCapitalizedStr(PARTICIPANT.DELEGATOR), link: DELEGATOR_PARTICIPANT },
  { label: getCapitalizedStr(PARTICIPANT.CONSUMER), link: CONSUMER_PARTICIPANT },
];

export const TabContent: React.FC = ({ children }) => {
  return (
    <div className={styles.tabContent}>
      <SeasonInfo season={CURR_SEASON} viewPrev={undefined} viewCurr={undefined} />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

//TODO: queryChallengesFn: typeof useS3DelegatorChallenges, typeof useS3ConsumerChallenges, typeof useS3IndexerChallenges
//TODO: dataKey replacement
//TODO: remove any
enum DATA_QUERY_KEY {
  INDEXER = 'indexer',
  DELEGATOR = 'delegator',
  CONSUMER = 'consumer',
}
interface MissionsProps {
  account: string;
  participant: PARTICIPANT;
  queryDataKey: DATA_QUERY_KEY;
  queryChallengesFn: any;
  queryDailyChallengesFn?: typeof useS3DailyChallenges;
}

const Missions = ({ account, queryChallengesFn, participant, queryDataKey, queryDailyChallengesFn }: MissionsProps) => {
  const challenges = queryChallengesFn({ account });
  const dailyChallenges = queryDailyChallengesFn ? queryDailyChallengesFn({ account }) : undefined;

  return (
    <TabContent>
      {renderAsync(challenges, {
        loading: () => <Spinner />,
        error: (e) => <Typography.Text type="danger">{`Failed to load challenges: ${e.message}`}</Typography.Text>,
        data: (data: any) => {
          const challenges = data[queryDataKey];
          const totalPoint =
            queryDataKey === DATA_QUERY_KEY.INDEXER && dailyChallenges?.data
              ? dailyChallenges?.data.S3Challenge.indexerTotalPoints
              : challenges.singleChallengePts;
          return (
            <MissionTable
              participant={participant}
              challenges={challenges}
              totalPoint={totalPoint}
              dailyChallenges={dailyChallenges?.data?.S3Challenge.indexerDailyChallenges}
            />
          );
        },
      })}
    </TabContent>
  );
};

// TODO: move no account wallet handler here
export const Home: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const [season, setSeason] = useState(CURR_SEASON);

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
          component={() => (
            <Missions
              account={account ?? ''}
              queryDataKey={DATA_QUERY_KEY.INDEXER}
              queryChallengesFn={useS3IndexerChallenges}
              queryDailyChallengesFn={useS3DailyChallenges}
              participant={PARTICIPANT.INDEXER}
            />
          )}
        />
        <Route
          exact
          path={DELEGATOR_PARTICIPANT}
          component={() => (
            <Missions
              queryDataKey={DATA_QUERY_KEY.DELEGATOR}
              account={account ?? ''}
              queryChallengesFn={useS3DelegatorChallenges}
              participant={PARTICIPANT.DELEGATOR}
            />
          )}
        />
        <Route
          exact
          path={CONSUMER_PARTICIPANT}
          component={() => (
            <Missions
              account={account ?? ''}
              queryDataKey={DATA_QUERY_KEY.CONSUMER}
              queryChallengesFn={useS3ConsumerChallenges}
              participant={PARTICIPANT.CONSUMER}
            />
          )}
        />
        <Redirect from={MISSION_ROUTE} to={INDEXER_PARTICIPANT} />
      </Switch>
    </>
  );
};
