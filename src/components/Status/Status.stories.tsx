// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Status from './Status';
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
  color: 'red',
};

export const Success = Template.bind({});

Success.args = {
  text: 'Success',
  color: 'green',
};
