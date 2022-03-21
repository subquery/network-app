// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Status, { StatusColor } from './Status';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Status',
  component: Status,
} as ComponentMeta<typeof Status>;

const Template: ComponentStory<typeof Status> = (args) => (
  <div>
    <Status {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  text: 'Status',
};

export const ErrorStatus = Template.bind({});

ErrorStatus.args = {
  text: 'Error',
  color: StatusColor.red,
};

export const Success = Template.bind({});

Success.args = {
  text: 'Success',
  color: StatusColor.green,
};
