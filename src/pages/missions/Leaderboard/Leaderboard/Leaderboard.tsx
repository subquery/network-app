// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch, useHistory } from 'react-router';
import { TableProps, Typography } from 'antd';
import { AntDTable, AppPageHeader, SearchInput, Spinner, TabButtons, TableText } from '../../../../components';
import styles from './Leaderboard.module.css';
import i18next from 'i18next';
import { CURR_SEASON, LEADERBOARD_ROUTE, MISSION_ROUTE, PARTICIPANT, SEASONS } from '../../constants';
import { SeasonProgress } from '../../../../components/SeasonProgress/SeasonProgress';
import { getCapitalizedStr, renderAsync } from '../../../../utils';
import { useS3ChallengeRanks, useS3DailyChallenges } from '../../../../containers/QueryLeaderboardProject';
import { SeasonContent } from '../../Mission';
import { TableTitle } from '../../../../components/TableTitle';
import { ROLE_CATEGORY } from '../../../../__generated__/leaderboard/globalTypes.d';
import { GetS3ChallengeRanks_S3Challenges_challenges as S3Rank } from '../../../../__generated__/leaderboard/GetS3ChallengeRanks';
import { GetS3ParticipantDailyChallenges_S3Challenge as S3AccountRank } from '../../../../__generated__/leaderboard/GetS3ParticipantDailyChallenges';
import { IndexerName } from '../../../../components/IndexerDetails/IndexerName';

const getColumns = (history: ReturnType<typeof useHistory>, participant: ROLE_CATEGORY) => {
  const columns: TableProps<S3Rank | S3AccountRank>['columns'] = [
    {
      title: <TableTitle title="rank" />,
      dataIndex: 'rank',
      width: '10%',
      render: (rank: number) => <TableText>{rank}</TableText>,
    },
    {
      title: <TableTitle title="account" />,
      dataIndex: 'id',
      render: (account, rank) => (
        <div className={styles.address}>
          <IndexerName address={account} name={rank.name} fullAddress />
        </div>
      ),
    },
    {
      title: <TableTitle title="points" />,
      dataIndex: 'totalPoints',
      sorter: (a, b) => a.totalPoints - b.totalPoints,
      render: (points, rank) => (
        <div
          className={styles.points}
          onClick={() => history.push(`${MISSION_ROUTE}/${CURR_SEASON}/${rank.id}/${participant.toLowerCase()}`)}
        >
          {i18next.t('missions.point', { count: points })}
        </div>
      ),
    },
  ];

  return columns;
};

interface RanksProps {
  participant: ROLE_CATEGORY;
}
const Ranks: React.VFC<RanksProps> = ({ participant }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [curPage, setCurPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const s3RanksQueryParam = { roleCategory: participant, skip: (curPage - 1) * pageSize, take: pageSize };
  const s3Ranks = useS3ChallengeRanks(s3RanksQueryParam);

  const fetchMore = () => {
    s3Ranks.fetchMore({
      variables: s3RanksQueryParam,
      updateQuery: (previousRanks, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousRanks;
        return { ...fetchMoreResult }; // make it as new object then will trigger render
      },
    });
  };

  /**
   * SearchInput logic
   * TODO: add filter to `S3Challenges` resolver to make table accept Type align
   */
  const [searchAccount, setSearchAccount] = React.useState<string | undefined>();
  const [searchError, setSearchError] = React.useState<string | undefined>();
  const searchedRank = useS3DailyChallenges({ account: searchAccount ?? '', roleCategory: participant });

  const SearchAccountRank = () => (
    <div className={styles.accountSearch}>
      <SearchInput
        onSearch={(value: string) => {
          setSearchAccount(value);
        }}
        defaultValue={searchAccount}
        loading={searchedRank.loading}
        emptyResult={searchedRank.data === undefined}
        placeholder={'Search address...'}
      />
    </div>
  );

  /**
   * SearchInput logic end
   */

  React.useEffect(() => {
    if (searchedRank.error) {
      setSearchError(searchedRank.error.message || 'Error: failed to search');
    }
  }, [searchedRank.error]);

  return (
    <SeasonContent>
      {renderAsync(s3Ranks, {
        loading: () => <Spinner />,
        error: (e) => <Typography.Text type="danger">{`Failed to load challenge ranks: ${e.message}`}</Typography.Text>,
        data: (data) => {
          const sortedData = searchedRank.data?.S3Challenge
            ? [searchedRank.data?.S3Challenge]
            : data.S3Challenges.challenges;

          const totalCount = searchAccount && searchedRank.data?.S3Challenge ? 1 : data.S3Challenges.totalCount;
          return (
            <>
              <div className={styles.header}>
                <Typography.Title level={3}>
                  {t('missions.participant', { count: totalCount || 0, role: participant.toLowerCase() })}
                </Typography.Title>
                <SearchAccountRank />
              </div>

              <AntDTable
                customPagination
                tableProps={{
                  columns: getColumns(history, participant),
                  rowKey: 'id',
                  dataSource: sortedData,
                }}
                paginationProps={{
                  total: totalCount,
                  pageSizeOptions: ['10', '20', '50'],
                  showSizeChanger: true,
                  current: curPage,
                  pageSize,
                  onChange: (page, pageSize) => {
                    setPageSize(pageSize);
                    setCurPage(page);
                    fetchMore();
                  },
                }}
              />
            </>
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
