// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import * as React from 'react';
import { GetIndexers_indexers_nodes as Indexer } from '../../__generated__/GetIndexers';
import ConnectedIndexerRow from './IndexerRow';

type Props = {
  indexers: Indexer[];
  onClick?: (indexerAddress: string) => void;
};

const IndexerList: React.FC<Props> = (props) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Indexer</TableCell>
          <TableCell>Total Stake (Next Stake)</TableCell>
          <TableCell>Commission</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {props.indexers.map((indexer) => (
          <ConnectedIndexerRow indexer={indexer} key={indexer.id} onClick={() => props.onClick?.(indexer.id)} />
        ))}
      </TableBody>
    </Table>
  );
};

export default IndexerList;
