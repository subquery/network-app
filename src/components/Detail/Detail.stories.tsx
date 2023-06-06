// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';

import Detail from './Detail';

export default {
  title: 'Detail',
  component: Detail,
} as ComponentMeta<typeof Detail>;

const Template: ComponentStory<typeof Detail> = (args) => <Detail {...args} />;

export const Default = Template.bind({});

Default.args = {
  label: 'Label',
  value: 'Value',
};

export const Link = Template.bind({});

Link.args = {
  label: 'Label',
  href: 'https://subquery.network',
  value: 'I am a link',
};

export const Copy = Template.bind({});

Copy.args = {
  label: 'Label',
  value: 'Copy me',
  canCopy: true,
};
