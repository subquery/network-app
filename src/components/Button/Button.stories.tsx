// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Button from './Button';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Button',
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  label: 'Button',
  type: 'primary',
};

export const Secondary = Template.bind({});

Secondary.args = {
  label: 'Button',
  type: 'secondary',
};

export const PrimaryWithIcon = Template.bind({});

PrimaryWithIcon.args = {
  label: 'Button',
  type: 'primary',
  leftItem: <i className="bi-plus" role="img" aria-label="Plus"></i>,
};

export const SecondaryWithIcon = Template.bind({});

SecondaryWithIcon.args = {
  label: 'Button',
  type: 'secondary',
  leftItem: <i className="bi-plus" role="img" aria-label="Plus"></i>,
};

export const SecondaryOnlyIcon = Template.bind({});

SecondaryOnlyIcon.args = {
  type: 'secondary',
  leftItem: <i className="bi-github" role="img" aria-label="GitHub"></i>,
};
