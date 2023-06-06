// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';

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
