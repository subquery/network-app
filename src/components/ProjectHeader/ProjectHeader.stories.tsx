// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ProjectHeader from './ProjectHeader';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IPFSProvider } from '../../containers';

export default {
  title: 'ProjectHeader',
  component: ProjectHeader,
} as ComponentMeta<typeof ProjectHeader>;

const Template: ComponentStory<typeof ProjectHeader> = (args) => (
  <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
    <ProjectHeader {...args} />
  </IPFSProvider>
);

export const Default = Template.bind({});

Default.args = {
  project: {
    id: '0x01',
    owner: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
    metadata: {
      name: 'Test Query Project',
      description: 'This is a test project for testing purposes',
      image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
      websiteUrl: 'https://example.com',
      codeUrl: 'https://example.com',
    },
  },
  versions: {
    QmQM5WojSBng5gKahBZR8ywvzsQ2U24VxiVyVptPDqvvcj: '1.0.0',
    QmSXrogTyP3yUddLAf3yrMhMamiYKcVuFW3LTeA9voYUt8: '1.0.1',
  },
  // currentVersion: 'QmSXrogTyP3yUddLAf3yrMhMamiYKcVuFW3LTeA9voYUt8'
};
