// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ProjectCard from './ProjectCard';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IPFSProvider } from '../../containers';

export default {
  title: 'ProjectCard',
  component: ProjectCard,
} as ComponentMeta<typeof ProjectCard>;

const Template: ComponentStory<typeof ProjectCard> = (args) => (
  <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
    <ProjectCard {...args} />
  </IPFSProvider>
);

export const Default = Template.bind({});

Default.args = {
  project: {
    id: '0x0000000000000000000000000000000000000000-1',
    owner: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    metadata: {
      name: 'Test Query Project',
      description: 'This is a test project for testing purposes',
      image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
      websiteUrl: 'https://example.com',
      codeUrl: 'https://example.com',
    },
  },
};

export const Minimal = Template.bind({});

Minimal.args = {
  project: {
    id: '0x0000000000000000000000000000000000000000-1',
    owner: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    metadata: {
      name: '',
      description: '',
      image: '',
      websiteUrl: '',
      codeUrl: '',
    },
  },
};

export const NoMeta = Template.bind({});

NoMeta.args = {
  project: {
    id: '0x0000000000000000000000000000000000000000-1',
    owner: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    metadata: undefined,
  },
};
