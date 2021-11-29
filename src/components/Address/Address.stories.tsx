// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import Address from './Address';

export default {
  title: 'Address',
  component: Address,
} as ComponentMeta<typeof Address>;

const Template: ComponentStory<typeof Address> = (args) => <Address {...args} />;

export const Small = Template.bind({});

Small.args = {
  address: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
  size: 'small',
};

export const Large = Template.bind({});

Large.args = {
  address: '0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB',
  size: 'large',
};
