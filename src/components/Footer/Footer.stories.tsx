// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './Footer';

export default {
  title: 'Footer',
  component: Footer,
} as ComponentMeta<typeof Footer>;

const Template: ComponentStory<typeof Footer> = (args) => {
  return (
    <Router>
      <Footer {...args} />
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
