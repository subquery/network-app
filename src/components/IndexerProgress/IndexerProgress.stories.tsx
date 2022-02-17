// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IndexerProgress from './IndexerProgress';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'IndexerProgress',
  component: IndexerProgress,
} as ComponentMeta<typeof IndexerProgress>;

const Template: ComponentStory<typeof IndexerProgress> = (args) => <IndexerProgress {...args} />;

export const Indexed = Template.bind({});

Indexed.args = {
  indexerStatus: [
    { indexer: 'Alice', latestBlock: 1234 },
    { indexer: 'Bob', latestBlock: 42 },
    { indexer: 'Claire', latestBlock: 456 },
  ],
  chainBlockHeight: 1234,
  startBlock: 0,
};

export const Indexing = Template.bind({});

Indexing.args = {
  indexerStatus: [
    { indexer: 'Alice', latestBlock: 1234 },
    { indexer: 'Bob', latestBlock: 42 },
    { indexer: 'Claire', latestBlock: 456 },
  ],
  chainBlockHeight: 2000,
  startBlock: 0,
};

export const NotIndexed = Template.bind({});

NotIndexed.args = {
  indexerStatus: [],
  chainBlockHeight: 1234,
  startBlock: 0,
};
