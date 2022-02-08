// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import NewProject from './NewProject';

export default {
  title: 'NewProject',
  component: NewProject,
} as ComponentMeta<typeof NewProject>;

const Template: ComponentStory<typeof NewProject> = (args) => <NewProject {...args} />;

export const Default = Template.bind({});

Default.args = {
  onSubmit: () => undefined,
};
