// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GraphQLPlayground } from './GraphQLPlayground';
import { ComponentStory, ComponentMeta } from '@storybook/react';
// import { buildSchema } from '../../utils';

export default {
  title: 'Playground',
  component: GraphQLPlayground,
} as ComponentMeta<typeof GraphQLPlayground>;

const Template: ComponentStory<typeof GraphQLPlayground> = (args) => <GraphQLPlayground {...args} />;

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
