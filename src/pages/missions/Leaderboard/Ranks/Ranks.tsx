// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address, Spinner } from '@subql/react-ui';
import { Table, Typography } from 'antd';

// import Search from 'antd/lib/input/Search';
import { ColumnsType } from 'antd/lib/table/interface';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLeaderboard } from '../../../../containers';
import { notEmpty, renderAsyncArray, mapAsync } from '../../../../utils';
import styles from './Ranks.module.css';

const { Paragraph } = Typography;

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
    width: '10%',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Indexer',
    dataIndex: 'indexer',
    key: 'indexer',
    width: '15%',
    render: (indexer: string) => <Address address={indexer} size={'large'} />,
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
  {
    width: '60%',
  },
];

const Ranks: React.FC<any> = (seasons: any) => {
  const indexers = useLeaderboard();
  const [state, setState] = useState('');
  // const currSeason = 1;

  return (
    <div className={styles.container}>
      <Typography>
        {/* <div className={styles.titlebutton}> */}
        {/* <h2>Current Season</h2> */}
        {/* <Button type="secondary" colorScheme='standard' label='Previous Season' /> */}
        {/* </div> */}
        {/* <p>Duration: {seasons.seasons[currSeason]["from"].toLocaleString().split(',')[0]} - {seasons.seasons[currSeason]["to"].toLocaleString().split(',')[0]}</p> */}
        {/* <Button type="secondary" label={'] view previous season'} colorScheme={'standard'} /> */}
        <Paragraph>Total {indexers.data?.indexerChallenges?.length} indexers</Paragraph>
      </Typography>
      {/* <Search placeholder="input search text" onSearch={(value: string) => setState(value)} style={{ width: 200 }} /> */}
      {renderAsyncArray(
        mapAsync((data) => {
          return data.indexerChallenges
            .filter(notEmpty)
            .filter((value) => value.name.toLocaleLowerCase().startsWith(state))
            .map((data, index) => {
              return {
                key: index,
                name: data.name,
                rank: index + 1,
                indexer: data.id,
                points: data.totalPoints,
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
