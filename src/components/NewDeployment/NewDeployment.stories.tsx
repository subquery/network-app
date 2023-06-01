// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';

import NewDeployment from './NewDeployment';

export default {
  title: 'NewDeployment',
  component: NewDeployment,
} as ComponentMeta<typeof NewDeployment>;

const Template: ComponentStory<typeof NewDeployment> = (args) => <NewDeployment {...args} />;

export const Default = Template.bind({});

Default.args = {};
