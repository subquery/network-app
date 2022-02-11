// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import * as React from 'react';
import { GetIndexerDelegators_indexer_delegations_nodes as Delegator } from '../../__generated__/GetIndexerDelegators';
import DelegatorRow from './DelegatorRow';

type Props = {
  delegators: Delegator[];
  onClick?: (indexerAddress: string) => void;
};

const IndexerList: React.FC<Props> = (props) => {
  // TODO filter delegators with 0 stake
  // TODO paging

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Delegator</TableCell>
          <TableCell>SQT Staked</TableCell>
          <TableCell>Effective Stake</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {props.delegators.map((delegator) => (
          <DelegatorRow
            delegator={delegator}
            key={delegator.delegatorAddress}
            onClick={() => props.onClick?.(delegator.delegatorAddress)}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default IndexerList;
