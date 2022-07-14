// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
import { Table, Typography } from 'antd';
import { Address } from '@subql/react-ui';
import { AppPageHeader, Copy, Spinner, TabButtons, TableText } from '../../../../components';
import styles from './Leaderboard.module.css';
import i18next from 'i18next';
import { CURR_SEASON, PARTICIPANT, SEASONS } from '../../constants';
import { SeasonProgress } from '../../../../components/SeasonProgress/SeasonProgress';
import { getCapitalizedStr, renderAsync } from '../../../../utils';
import { useS3ChallengeRanks } from '../../../../containers/QueryLeaderboardProject';
import { TabContent } from '../../Mission';
import { TableTitle } from '../../../../components/TableTitle';
import { ROLE_CATEGORY } from '../../../../__generated__/leaderboard/globalTypes.d';
import { GetS3ChallengeRanks_S3Challenges as S3Ranks } from '../../../../__generated__/leaderboard/GetS3ChallengeRanks';

// TODO: rank id with same points
// TODO: name with account col
// TODO: totalCount field,otherwise no pagination feature
const getColumns = (participant: ROLE_CATEGORY, curPage = 1) => {
  const columns = [
    {
      title: <TableTitle title="#" />,
      dataIndex: 'id',
      width: '10%',
      render: (_: string, __: any, idx: number) => <TableText>{(curPage - 1) * 10 + (idx + 1)}</TableText>,
    },
    {
      title: <TableTitle title="account" />,
      dataIndex: 'id',
      render: (account: string) => (
        <div className={styles.address}>
          <Address address={account} truncated={false} size={'large'} />
          <Copy value={account} className={styles.copy} iconClassName={styles.copyIcon} />
        </div>
      ),
    },
  ];

  const indexerCols = [
    {
      title: <TableTitle title="points" />,
      dataIndex: 'indexerTotalPoints',
      sorter: (a: S3Ranks, b: S3Ranks) => a.indexerTotalPoints - b.indexerTotalPoints,
      render: (points: number) => <TableText>{i18next.t('missions.point', { count: points })}</TableText>,
    },
  ];

  const consumerCols = [
    {
      title: <TableTitle title="points" />,
      dataIndex: 'consumerTotalPoints',
      sorter: (a: S3Ranks, b: S3Ranks) => a.consumerTotalPoints - b.consumerTotalPoints,
      render: (points: number) => <TableText>{i18next.t('missions.point', { count: points })}</TableText>,
    },
  ];

  const delegatorCols = [
    {
      title: <TableTitle title="points" />,
      dataIndex: 'delegatorTotalPoints',
      sorter: (a: S3Ranks, b: S3Ranks) => a.delegatorTotalPoints - b.delegatorTotalPoints,
      render: (points: number) => <TableText>{i18next.t('missions.point', { count: points })}</TableText>,
    },
  ];

  const dataKeyMapping = {
    [ROLE_CATEGORY.INDEXER]: [...columns, ...indexerCols],
    [ROLE_CATEGORY.CONSUMER]: [...columns, ...consumerCols],
    [ROLE_CATEGORY.DELEGATOR]: [...columns, ...delegatorCols],
  };

  return dataKeyMapping[participant];
};

interface RanksProps {
  participant: ROLE_CATEGORY;
}
const Ranks: React.VFC<RanksProps> = ({ participant }) => {
  const [curPage, setCurPage] = React.useState<number>(1);
  const s3Ranks = useS3ChallengeRanks({ roleCategory: participant });

  return (
    <TabContent>
      {renderAsync(s3Ranks, {
        loading: () => <Spinner />,
        error: (e) => <Typography.Text type="danger">{`Failed to load challenge ranks: ${e.message}`}</Typography.Text>,
        data: (data) => {
          return (
            <Table
              columns={getColumns(participant, curPage)}
              dataSource={data.S3Challenges}
              key="id"
              pagination={{
                onChange(current) {
                  setCurPage(current);
                },
                showSizeChanger: false,
              }}
            />
          );
        },
      })}
    </TabContent>
  );
};

export const LEADERBOARD_ROUTE = `/missions/ranks`;
const INDEXER_PARTICIPANTS = `${LEADERBOARD_ROUTE}/indexer`;
const DELEGATOR_PARTICIPANTS = `${LEADERBOARD_ROUTE}/delegator`;
const CONSUMER_PARTICIPANTS = `${LEADERBOARD_ROUTE}/consumer`;

const buttonLinks = [
  { label: getCapitalizedStr(PARTICIPANT.INDEXER), link: INDEXER_PARTICIPANTS },
  { label: getCapitalizedStr(PARTICIPANT.DELEGATOR), link: DELEGATOR_PARTICIPANTS },
  { label: getCapitalizedStr(PARTICIPANT.CONSUMER), link: CONSUMER_PARTICIPANTS },
];

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
