// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IPFSImage from './IPFSImage';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IPFSProvider } from '../../containers';

export default {
  title: 'IPFSImage',
  component: IPFSImage,
} as ComponentMeta<typeof IPFSImage>;

const Template: ComponentStory<typeof IPFSImage> = (args) => (
  <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
    <IPFSImage {...args} style={{ height: '100px' }} />
  </IPFSProvider>
);

export const FromLink = Template.bind({});

FromLink.args = {
  src: 'https://project.subquery.network/static/media/logo.c387f568.png',
};

// export const FromBase64 = Template.bind({});

// FromBase64.args = {
//   src: ''
// };

export const FromIPFS = Template.bind({});

FromIPFS.args = {
  src: 'QmSHRjrjBQCpdtjkoUdgKs6kCgdeYsJx5qmqijCp8Yjruh',
};
