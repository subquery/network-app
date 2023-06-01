// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BrowserRouter as Router } from 'react-router-dom';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Button } from './Button';

export default {
  title: 'Button',
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => {
  return (
    <Router>
      <Button>Button</Button>
    </Router>
  );
};

export const Desktop = Template.bind({});

export const Mobile = Template.bind({});

Mobile.parameters = {
  viewport: {
    defaultViewport: 'iphonex',
  },
};
