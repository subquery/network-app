// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IndexerDetails from './IndexerDetails';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Status } from '../../__generated__/globalTypes';

export default {
  title: 'IndexerDetails',
  component: IndexerDetails,
} as ComponentMeta<typeof IndexerDetails>;

const Template: ComponentStory<typeof IndexerDetails> = (args) => <IndexerDetails {...args} />;

export const Default = Template.bind({});

Default.args = {
  indexers: [
    {
      __typename: 'Indexer',
      id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
      indexer: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      blockHeight: '1000',
      timestamp: new Date(),
      status: Status.INDEXING,
    },
    {
      __typename: 'Indexer',
      id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
      indexer: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      blockHeight: '1000',
      timestamp: new Date(),
      status: Status.INDEXING,
    },
  ],
};
