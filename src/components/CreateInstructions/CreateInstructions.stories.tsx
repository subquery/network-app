// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import CreateInstructions from './CreateInstructions';

export default {
  title: 'CreateInstructions',
  component: CreateInstructions,
} as ComponentMeta<typeof CreateInstructions>;

const Template: ComponentStory<typeof CreateInstructions> = (args) => <CreateInstructions {...args} />;

export const Default = Template.bind({});

Default.args = {};
