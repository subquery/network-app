// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter as Router } from 'react-router-dom';
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
