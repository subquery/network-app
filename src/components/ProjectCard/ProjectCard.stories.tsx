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
  <IPFSProvider initialState={{ gateway: 'http://localhost:5001/api/v0' }}>
    <ProjectCard {...args} />
  </IPFSProvider>
);

export const Default = Template.bind({});

Default.args = {
  project: {
    id: '0x0000000000000000000000000000000000000000-1',
    metadata: {
      name: 'Test Query Project',
      subtitle: 'A project that provides a simple example',
      description: 'This is a test project for testing purposes',
      image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
      websiteUrl: 'https://example.com',
    },
  },
};

export const Minimal = Template.bind({});

Minimal.args = {
  project: {
    id: '0x0000000000000000000000000000000000000000-1',
    metadata: {
      name: '',
      subtitle: 'A project that provides a simple example',
      description: '',
      image: '',
      websiteUrl: '',
    },
  },
};
