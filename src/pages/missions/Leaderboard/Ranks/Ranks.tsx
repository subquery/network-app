// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address, Button, Spinner } from '@subql/react-ui';
import { Table, Typography } from 'antd';

import { ColumnsType } from 'antd/lib/table/interface';
import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Copy, SearchAddress } from '../../../../components';
import { SeasonInfo } from '../../../../components/SeasonInfo/SeasonInfo';
import { useLeaderboard } from '../../../../containers';
import { notEmpty, renderAsyncArray, mapAsync } from '../../../../utils';
import { CURR_SEASON } from '../../constants';
import styles from './Ranks.module.css';

const columns: ColumnsType<{
  key: number;
  rank: number;
  indexer: string;
  points: number;
}> = [
  {
    title: '#',
    dataIndex: 'rank',
    key: 'rank',
    width: '5%',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '15%',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Indexer',
    dataIndex: 'indexer',
    key: 'indexer',
    width: '40%',
    render: (indexer: string) => (
      <div className={styles.address}>
        <Address address={indexer} truncated={false} size={'large'} />
        <Copy value={indexer} className={styles.copy} iconClassName={styles.copyIcon} />
      </div>
    ),
  },
  {
    title: 'Points',
    dataIndex: 'points',
    key: 'points',
    width: '20%',
    render: (points: string, record) => (
      <NavLink to={'/missions/user/' + record.indexer} key={'/missions/user/' + record.indexer}>
        {points} points
      </NavLink>
    ),
  },
];

const Ranks: React.FC<{ season: number; viewPrev: () => void; viewCurr: () => void }> = ({
  season,
  viewPrev,
  viewCurr,
}) => {
  const indexers = useLeaderboard();
  const [searchText, setSearchText] = useState('');

  return (
    <div className={styles.container}>
      <SeasonInfo season={season} viewPrev={viewPrev} viewCurr={viewCurr} />

      <div className={styles.topBar}>
        <h2>Total {indexers.data?.indexerChallenges?.length} indexers</h2>
        <div className={styles.searchBar}>
          <SearchAddress defaultValue={searchText} onSearch={(value: string) => setSearchText(value)} />
        </div>
      </div>
      {renderAsyncArray(
        mapAsync((data) => {
          return data.indexerChallenges
            .filter(notEmpty)
            .sort((a, b) => b.singlePoints - a.singlePoints)
            .map((data, index) => ({ ...data, rank: index + 1 }))
            .filter((value) => value.id.startsWith(searchText))
            .map((data, index) => {
              return {
                key: index,
                name: data.name,
                rank: data.rank,
                indexer: data.id,
                points: data.singlePoints,
              };
            });
        }, indexers),
        {
          error: (e) => <Typography>{`Error: Fail to get Indexers ${e.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography>No Indexers available.</Typography>,
          data: (data) => <Table columns={columns} dataSource={data} />,
        },
      )}
    </div>
  );
};

export default Ranks;
