// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Playground from './Playground';
import { ComponentStory, ComponentMeta } from '@storybook/react';
// import { buildSchema } from '../../utils';

export default {
  title: 'Playground',
  component: Playground,
} as ComponentMeta<typeof Playground>;

const Template: ComponentStory<typeof Playground> = (args) => <Playground {...args} />;

// export const Default = Template.bind({});

// Default.args = {
//   endpoint: '',
//   schema: buildSchema(`type StarterEntity @entity {

//   id: ID! #id is a required field

//   field1: Int!

//   field2: String #filed2 is an optional field

//   field3: BigInt

//   field4: Date

//   field5: Boolean
// }`),
// };
