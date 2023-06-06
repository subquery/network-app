// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';

import Copy from './Copy';

export default {
  title: 'Copy',
  component: Copy,
} as ComponentMeta<typeof Copy>;

const Template: ComponentStory<typeof Copy> = (args) => <Copy {...args} />;

export const Default = Template.bind({});

Default.args = {
  value: 'Hello World',
};
