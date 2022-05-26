// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Status } from '../../__generated__/registry/globalTypes';
import { Row } from './Row';
import { useTranslation } from 'react-i18next';
import { IPFSProvider } from '../../containers';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../Table';

export default {
  title: 'IndexerDetailsRow',
  component: Row,
} as ComponentMeta<typeof Row>;

const Template: ComponentStory<typeof Row> = (args) => {
  const { t } = useTranslation();
  return (
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
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
    </IPFSProvider>
  );
};

export const NoMetadata = Template.bind({});

NoMetadata.args = {
  indexer: {
    __typename: 'DeploymentIndexer',
    id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
    indexerId: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    blockHeight: '999999',
    timestamp: new Date(),
    status: Status.INDEXING,
    indexer: {
      __typename: 'Indexer',
      metadata: '',
    },
  },
  metadata: { loading: false, data: undefined },
  progressInfo: {
    data: {
      targetBlock: 1000000,
      startBlock: 0,
      currentBlock: 999999,
    },
    loading: false,
  },
};

export const LoadingMetadata = Template.bind({});

LoadingMetadata.args = {
  indexer: {
    __typename: 'DeploymentIndexer',
    id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
    indexerId: '0x759Dc965026Ea8D6919451c0B1eaD337bD60ddeD',
    blockHeight: '654321',
    timestamp: new Date(),
    status: Status.INDEXING,
    indexer: {
      __typename: 'Indexer',
      metadata: '',
    },
  },
  metadata: { loading: true, data: undefined },
  progressInfo: {
    data: {
      targetBlock: 1000000,
      startBlock: 0,
      currentBlock: 654321,
    },
    loading: false,
  },
};

export const WithMetadata = Template.bind({});

WithMetadata.args = {
  indexer: {
    __typename: 'DeploymentIndexer',
    id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
    indexerId: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    blockHeight: '1000',
    timestamp: new Date(),
    status: Status.INDEXING,
    indexer: {
      __typename: 'Indexer',
      metadata: '',
    },
  },
  metadata: {
    loading: false,
    data: {
      name: 'Joe Blogs',
      image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
      url: 'https://subquery.network',
    },
  },
  progressInfo: {
    data: {
      targetBlock: 1000000,
      startBlock: 0,
      currentBlock: 1000,
    },
    loading: false,
  },
};
