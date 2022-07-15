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
import {
  CURR_SEASON,
  MISSION_ROUTE,
  OWN_CONSUMER_PARTICIPANT,
  OWN_DELEGATOR_PARTICIPANT,
  OWN_INDEXER_PARTICIPANT,
  PARTICIPANT,
  SEASONS,
} from '../constants';
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
import { ROLE_CATEGORY } from '../../../__generated__/leaderboard/globalTypes.d';

export const SeasonContent: React.FC = ({ children }) => {
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
  const dailyChallenges = queryDailyChallengesFn
    ? queryDailyChallengesFn({ account, roleCategory: ROLE_CATEGORY.INDEXER })
    : undefined;

  return (
    <SeasonContent>
      {renderAsync(challenges, {
        loading: () => <Spinner />,
        error: (e) => <Typography.Text type="danger">{`Failed to load challenges: ${e.message}`}</Typography.Text>,
        data: (data: any) => {
          const challenges = data[queryDataKey];
          const totalPoint =
            queryDataKey === DATA_QUERY_KEY.INDEXER && dailyChallenges?.data
              ? dailyChallenges?.data.S3Challenge.indexerTotalPoints
              : challenges?.singleChallengePts;
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
    </SeasonContent>
  );
};

interface HomeProps {
  account: string;
  indexerPath: string;
  delegatorPath: string;
  consumerPath: string;
  rootPath?: string;
}

export const MissionTabs: React.FC<HomeProps> = ({ account, rootPath, indexerPath, delegatorPath, consumerPath }) => {
  const buttonLinks = [
    { label: getCapitalizedStr(PARTICIPANT.INDEXER), link: indexerPath },
    { label: getCapitalizedStr(PARTICIPANT.DELEGATOR), link: delegatorPath },
    { label: getCapitalizedStr(PARTICIPANT.CONSUMER), link: consumerPath },
  ];
  return (
    <>
      <div className={styles.tabList}>
        <TabButtons tabs={buttonLinks} whiteTab />
      </div>
      <Switch>
        <Route
          exact
          path={indexerPath}
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
          path={delegatorPath}
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
          path={consumerPath}
          component={() => (
            <Missions
              account={account ?? ''}
              queryDataKey={DATA_QUERY_KEY.CONSUMER}
              queryChallengesFn={useS3ConsumerChallenges}
              participant={PARTICIPANT.CONSUMER}
            />
          )}
        />
        {rootPath && <Redirect from={rootPath} to={indexerPath} />}
      </Switch>
    </>
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

      <MissionTabs
        account={account ?? ''}
        indexerPath={OWN_INDEXER_PARTICIPANT}
        delegatorPath={OWN_DELEGATOR_PARTICIPANT}
        consumerPath={OWN_CONSUMER_PARTICIPANT}
        rootPath={MISSION_ROUTE}
      />
    </>
  );
};
