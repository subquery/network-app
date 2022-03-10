// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ProjectOverview from './ProjectOverview';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'ProjectOverview',
  component: ProjectOverview,
} as ComponentMeta<typeof ProjectOverview>;

const Template: ComponentStory<typeof ProjectOverview> = (args) => <ProjectOverview {...args} />;

export const Default = Template.bind({});

Default.args = {
  metadata: {
    name: 'Test Query Project',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    image: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
    websiteUrl: 'https://subquery.network',
    codeUrl: 'https://github.com/subquery',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  deploymentDescription: 'Fix various bugs',
};
