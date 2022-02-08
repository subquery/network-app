// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';

export default {
  title: 'Header',
  component: Header,
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args) => {
  return (
    <Router>
      <Header {...args} />
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
