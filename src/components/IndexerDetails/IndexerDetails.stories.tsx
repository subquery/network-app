// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Status } from '../../__generated__/globalTypes';
import { Row } from './Row';
import { useTranslation } from 'react-i18next';
import { IPFSProvider } from '../../containers';

export default {
  title: 'IndexerDetailsRow',
  component: Row,
} as ComponentMeta<typeof Row>;

const Template: ComponentStory<typeof Row> = (args) => {
  const { t } = useTranslation();
  return (
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{t('indexers.head.indexers')}</TableCell>
              <TableCell>{t('indexers.head.progress')}</TableCell>
              <TableCell>{t('indexers.head.status')}</TableCell>
              <TableCell>{t('indexers.head.url')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Row {...args} />
          </TableBody>
        </Table>
      </TableContainer>
    </IPFSProvider>
  );
};

export const NoMetadata = Template.bind({});

NoMetadata.args = {
  indexer: {
    __typename: 'Indexer',
    id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
    indexer: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    blockHeight: '999999',
    timestamp: new Date(),
    status: Status.INDEXING,
  },
  metadata: { loading: false, data: undefined },
  targetBlock: 1000000,
};

export const LoadingMetadata = Template.bind({});

LoadingMetadata.args = {
  indexer: {
    __typename: 'Indexer',
    id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
    indexer: '0x759Dc965026Ea8D6919451c0B1eaD337bD60ddeD',
    blockHeight: '654321',
    timestamp: new Date(),
    status: Status.INDEXING,
  },
  metadata: { loading: true, data: undefined },
  targetBlock: 1000000,
};

export const WithMetadata = Template.bind({});

WithMetadata.args = {
  indexer: {
    __typename: 'Indexer',
    id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
    indexer: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    blockHeight: '1000',
    timestamp: new Date(),
    status: Status.INDEXING,
  },
  metadata: {
    loading: false,
    data: {
      name: 'Joe Blogs',
      image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
      url: 'https://subquery.network',
    },
  },
  targetBlock: 1000000,
};
