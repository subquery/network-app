// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IndexerDetails from './IndexerDetails';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'IndexerDetails',
  component: IndexerDetails,
} as ComponentMeta<typeof IndexerDetails>;

const Template: ComponentStory<typeof IndexerDetails> = (args) => <IndexerDetails {...args} />;

export const Default = Template.bind({});

Default.args = {
  indexers: [
    {
      id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
      indexer: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      blockHeight: '1000',
      status: 'indexing',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw-0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
      indexer: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
      blockHeight: '1000',
      status: 'indexing',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};
