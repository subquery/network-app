// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';

import Banner from './Banner';

export default {
  title: 'Banner',
  component: Banner,
} as ComponentMeta<typeof Banner>;

const Template: ComponentStory<typeof Banner> = (args) => <Banner {...args} />;

export const Default = Template.bind({});

Default.args = {
  text: 'Transaction ID: asdfasdfasdfasdfasdfasdf',
};
