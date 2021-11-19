// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Spinner from './Spinner';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Spinner',
  component: Spinner,
} as ComponentMeta<typeof Spinner>;

const Template: ComponentStory<typeof Spinner> = (args) => <Spinner {...args} />;

export const Default = Template.bind({});

Default.args = {};
