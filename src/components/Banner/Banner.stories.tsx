// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
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
