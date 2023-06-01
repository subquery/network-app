// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Table, TableBody, TableCell, TableHead, TableRow } from './Table';

export default {
  title: 'Table',
  component: Table,
} as ComponentMeta<typeof Table>;

const Template: ComponentStory<typeof Table> = (args) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Header 1</TableCell>
        <TableCell>Header 2</TableCell>
        <TableCell>Header 3</TableCell>
        <TableCell>Header 4</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {[1, 2, 3, 4].map((n) => (
        <TableRow key={n}>
          {[1, 2, 3, 4].map((m) => (
            <TableCell key={m}>{`Row ${n}, Col ${m}`}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const Default = Template.bind({});

Default.args = {};
