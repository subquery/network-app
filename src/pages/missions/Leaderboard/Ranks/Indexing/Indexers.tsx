// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address, Button, Spinner } from '@subql/react-ui';
import { Table, Typography } from 'antd';
import { Tag, Space } from 'antd';

import Search from 'antd/lib/input/Search';
import { formatEther } from 'ethers/lib/utils';
import { ReactChild, ReactFragment, ReactPortal } from 'react';
import { renderAsync, mergeAsync } from '../../../../../utils';
import { DoStake } from '../../../../staking/Indexer/DoStake';
import { IndexingContent } from '../../../../staking/Indexer/Indexing';
// import { NotRegisteredIndexer } from "../Indexing";
import styles from './Indexers.module.css';

const { Title, Paragraph, Text } = Typography;

const columns = [
  {
    title: '#',
    dataIndex: 'rank',
    key: 'rank',
    width: '5%',
  },
  {
    title: 'Indexer',
    dataIndex: 'indexer',
    key: 'indexer',
    width: '20%',
    render: (indexer: string) => <Address address={indexer} size={'large'} />,
  },
  {
    title: 'Points',
    dataIndex: 'points',
    key: 'points',
    render: (text: string) => <a>{text}</a>,
  },
];

const data = [
  {
    key: '1',
    rank: '1',
    indexer: '0xDa77d72dB875492E52fBbB258815E29Ac67Fe455',
    points: '0',
  },
];

const Indexers: React.VFC<{ delegatorAddress: string }> = ({ delegatorAddress }) => {
  return (
    <div className={styles.container}>
      <Typography>
        <Title>Current Season</Title>
        <Button type="secondary" label={'[translate] view previous season'} colorScheme={'standard'} />
        <Paragraph>Duration: 16/02/2022 - 23/02/2022 Data is typically updated every few minutes</Paragraph>
        <Text>Total 24 indexers</Text>
      </Typography>
      <Search placeholder="input search text" style={{ width: 200 }} />
      <Table columns={columns} dataSource={data} />

      {/* FIXME: get data for table  */}
      {/* Pagination menu component */}
    </div>
  );
};

export default Indexers;
