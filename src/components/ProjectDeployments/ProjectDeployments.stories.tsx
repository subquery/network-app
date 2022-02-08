// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ProjectDeployments from './ProjectDeployments';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'ProjectDeployments',
  component: ProjectDeployments,
} as ComponentMeta<typeof ProjectDeployments>;

const Template: ComponentStory<typeof ProjectDeployments> = (args) => <ProjectDeployments {...args} />;

export const Default = Template.bind({});

Default.args = {
  deployments: [
    {
      version: '0.0.1',
      deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
      description: 'Initial release',
      createdAt: new Date(),
    },
    {
      version: '0.1.0',
      deploymentId: 'QmSUKKDUYFCs7AURoUEu4heYoJCZwqDoPkMZGLDerFoWqw',
      description: 'Updated chain types',
      createdAt: new Date(),
    },
  ],
};
