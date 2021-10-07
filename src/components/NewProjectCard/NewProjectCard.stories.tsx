// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NewProjectCard from './NewProjectCard';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'NewProjectCard',
  component: NewProjectCard,
} as ComponentMeta<typeof NewProjectCard>;

const Template: ComponentStory<typeof NewProjectCard> = (args) => <NewProjectCard {...args} />;

export const Default = Template.bind({});
