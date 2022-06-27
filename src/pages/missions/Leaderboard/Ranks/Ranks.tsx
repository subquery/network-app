// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address, Spinner } from '@subql/react-ui';
import { Table, Typography } from 'antd';

import { ColumnsType } from 'antd/lib/table/interface';
import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Copy, SearchInput } from '../../../../components';
import { SeasonInfo } from '../../../../components/SeasonInfo/SeasonInfo';
import { notEmpty, renderAsyncArray, mapAsync } from '../../../../utils';
import styles from './Ranks.module.css';

const columns: ColumnsType<{
  season: string;
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

const Ranks: React.FC<{ season: number; ranks: any; viewPrev: () => void; viewCurr: () => void }> = ({
  season,
  ranks,
  viewPrev,
  viewCurr,
}) => {
  const [searchText, setSearchText] = useState('');

  return (
    <div className={styles.container}>
      <SeasonInfo season={season} viewPrev={viewPrev} viewCurr={viewCurr} />

      <div className={styles.topBar}>
        <h2>{ranks.data?.indexerS3Challenges?.length} Participants</h2>
        <div className={styles.searchBar}>
          <SearchInput defaultValue={searchText} onSearch={(value: string) => setSearchText(value)} />
        </div>
      </div>
      {renderAsyncArray(
        mapAsync((data: any) => {
          let challenges;
          if (season === 3) {
            challenges = data?.indexerS3Challenges;
          }
          if (season === 2) {
            challenges = data?.indexerS2Challenges;
          }

          return challenges
            .filter(notEmpty)
            .sort((a: { singlePoints: number }, b: { singlePoints: number }) => b.singlePoints - a.singlePoints)
            .map((data: any, index: number) => ({ ...data, rank: index + 1 }))
            .filter((value: { id: string }) => value.id.startsWith(searchText))
            .map((data: { name: any; rank: any; id: any; singlePoints: any }, index: any) => {
              return {
                key: index,
                name: data.name,
                rank: data.rank,
                season: season,
                indexer: data.id,
                points: data.singlePoints,
              };
            });
        }, ranks),
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
