// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ProjectHeader from './ProjectHeader';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IPFSProvider } from '../../containers';

export default {
  title: 'ProjectHeader',
  component: ProjectHeader,
} as ComponentMeta<typeof ProjectHeader>;

const Template: ComponentStory<typeof ProjectHeader> = (args) => (
  <IPFSProvider initialState={{ gateway: 'http://localhost:5001/api/v0' }}>
    <ProjectHeader {...args} />
  </IPFSProvider>
);

export const Default = Template.bind({});

Default.args = {
  project: {
    id: '0x0000000000000000000000000000000000000000-1',
    deployment: 'QmZf1wBc26x9jCuxWmzpMtqX799DqQnvGuT16Xu7JtAHo2',
    metadata: {
      name: 'Test Query Project',
      subtitle: 'A project that provides a simple example',
      description: 'This is a test project for testing purposes',
      image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
      websiteUrl: 'https://example.com',
    },
    manifest: {} as any,
    schema: {} as any,
  },
};
