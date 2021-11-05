// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ProjectDetail from './ProjectDetail';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IPFSProvider } from '../../containers';

export default {
  title: 'ProjectDetail',
  component: ProjectDetail,
} as ComponentMeta<typeof ProjectDetail>;

const Template: ComponentStory<typeof ProjectDetail> = (args) => (
  <IPFSProvider initialState={{ gateway: 'http://localhost:5001/api/v0' }}>
    <ProjectDetail {...args} />
  </IPFSProvider>
);

export const Default = Template.bind({});

Default.args = {
  project: {
    id: '0x0000000000000000000000000000000000000000-1',
    deployment: {
      id: 'QmZf1wBc26x9jCuxWmzpMtqX799DqQnvGuT16Xu7JtAHo2',
      manifest: {
        asV0_2_0: {
          network: {
            genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
          },
        },
      } as any,
      schema: {} as any,
    },
    metadata: {
      name: 'Test Query Project',
      subtitle: 'A project that provides a simple example',
      description: 'This is a test project for testing purposes',
      image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
      websiteUrl: 'https://example.com',
    },
  },
};
