// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import NoIndexers from './NoIndexers';

export default {
  title: 'NoIndexers',
  component: NoIndexers,
} as ComponentMeta<typeof NoIndexers>;

const Template: ComponentStory<typeof NoIndexers> = (args) => <NoIndexers {...args} />;

export const Default = Template.bind({});
