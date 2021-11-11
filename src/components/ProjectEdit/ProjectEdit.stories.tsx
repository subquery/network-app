// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ProjectEdit from './ProjectEdit';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IPFSProvider } from '../../containers';

export default {
  title: 'ProjectEdit',
  component: ProjectEdit,
} as ComponentMeta<typeof ProjectEdit>;

const Template: ComponentStory<typeof ProjectEdit> = (args) => (
  <IPFSProvider initialState={{ gateway: 'http://localhost:5001/api/v0' }}>
    <ProjectEdit {...args} />
  </IPFSProvider>
);

export const Default = Template.bind({});

Default.args = {
  project: {
    id: '0x00000000000000000000000000000000000000001',
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
