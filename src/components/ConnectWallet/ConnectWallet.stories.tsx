// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ConnectWallet } from './ConnectWallet';

export default {
  title: 'ConnectWallet',
  component: ConnectWallet,
} as ComponentMeta<typeof ConnectWallet>;

const Template: ComponentStory<typeof ConnectWallet> = (args) => <ConnectWallet {...args} />;

export const Default = Template.bind({});

Default.args = {};
