// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch, useHistory } from 'react-router';
import { Table, TableProps, Typography } from 'antd';
import { AppPageHeader, Copy, Spinner, TabButtons, TableText } from '../../../../components';
import styles from './Leaderboard.module.css';
import i18next from 'i18next';
import { CURR_SEASON, LEADERBOARD_ROUTE, MISSION_ROUTE, PARTICIPANT, SEASONS } from '../../constants';
import { SeasonProgress } from '../../../../components/SeasonProgress/SeasonProgress';
import { getCapitalizedStr, renderAsync } from '../../../../utils';
import { useS3ChallengeRanks } from '../../../../containers/QueryLeaderboardProject';
import { SeasonContent } from '../../Mission';
import { TableTitle } from '../../../../components/TableTitle';
import { ROLE_CATEGORY } from '../../../../__generated__/leaderboard/globalTypes.d';
import { GetS3ChallengeRanks_S3Challenges_challenges as S3Rank } from '../../../../__generated__/leaderboard/GetS3ChallengeRanks';
import { IndexerName } from '../../../../components/IndexerDetails/IndexerName';

const getColumns = () => {
  const columns: TableProps<S3Rank>['columns'] = [
    {
      title: <TableTitle title="rank" />,
      dataIndex: 'rank',
      width: '10%',
      render: (rank: number) => <TableText>{rank}</TableText>,
    },
    {
      title: <TableTitle title="account" />,
      dataIndex: 'id',
      render: (account: string, rank: S3Rank) => (
        <div className={styles.address}>
          <IndexerName address={account} name={rank.name} fullAddress />
        </div>
      ),
    },
    {
      title: <TableTitle title="points" />,
      dataIndex: 'totalPoints',
      sorter: (a: S3Rank, b: S3Rank) => a.totalPoints - b.totalPoints,
      render: (points: number) => <TableText>{i18next.t('missions.point', { count: points })}</TableText>,
    },
  ];

  return columns;
};

interface RanksProps {
  participant: ROLE_CATEGORY;
}
const Ranks: React.VFC<RanksProps> = ({ participant }) => {
  const [curPage, setCurPage] = React.useState<number>(1);
  const history = useHistory();
  const s3Ranks = useS3ChallengeRanks({ roleCategory: participant });

  return (
    <SeasonContent>
      {renderAsync(s3Ranks, {
        loading: () => <Spinner />,
        error: (e) => <Typography.Text type="danger">{`Failed to load challenge ranks: ${e.message}`}</Typography.Text>,
        data: (data) => {
          return (
            <Table
              columns={getColumns()}
              dataSource={data.S3Challenges.challenges}
              key="id"
              pagination={{
                onChange(current) {
                  setCurPage(current);
                },
                showSizeChanger: false,
              }}
              onRow={(record) => {
                return {
                  onClick: () => history.push(`${MISSION_ROUTE}/${CURR_SEASON}/${record.id}`),
                };
              }}
            />
          );
        },
      })}
    </SeasonContent>
  );
};

const INDEXER_PARTICIPANTS = `${LEADERBOARD_ROUTE}/indexer`;
const DELEGATOR_PARTICIPANTS = `${LEADERBOARD_ROUTE}/delegator`;
const CONSUMER_PARTICIPANTS = `${LEADERBOARD_ROUTE}/consumer`;

const buttonLinks = [
  { label: getCapitalizedStr(PARTICIPANT.INDEXER), link: INDEXER_PARTICIPANTS },
  { label: getCapitalizedStr(PARTICIPANT.DELEGATOR), link: DELEGATOR_PARTICIPANTS },
  { label: getCapitalizedStr(PARTICIPANT.CONSUMER), link: CONSUMER_PARTICIPANTS },
];

// TODO: curSeason can make as hook.context
export const Leaderboard: React.VFC = () => {
  const { t } = useTranslation();
  const [season, setSeason] = React.useState(CURR_SEASON);

  return (
    <>
      <AppPageHeader title={t('missions.leaderboard')} />
      <SeasonProgress timePeriod={SEASONS[season]} />

      <div className={styles.tabList}>
        <TabButtons tabs={buttonLinks} whiteTab />
      </div>

      <Switch>
        <Route exact path={INDEXER_PARTICIPANTS} component={() => <Ranks participant={ROLE_CATEGORY.INDEXER} />} />
        <Route exact path={DELEGATOR_PARTICIPANTS} component={() => <Ranks participant={ROLE_CATEGORY.DELEGATOR} />} />
        <Route exact path={CONSUMER_PARTICIPANTS} component={() => <Ranks participant={ROLE_CATEGORY.CONSUMER} />} />
        <Redirect from={LEADERBOARD_ROUTE} to={INDEXER_PARTICIPANTS} />
      </Switch>
    </>
  );
};
