// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NewDeployment from './NewDeployment';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'NewDeployment',
  component: NewDeployment,
} as ComponentMeta<typeof NewDeployment>;

const Template: ComponentStory<typeof NewDeployment> = (args) => <NewDeployment {...args} />;

export const Default = Template.bind({});

Default.args = {};
