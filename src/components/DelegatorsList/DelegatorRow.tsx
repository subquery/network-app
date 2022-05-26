// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import { TableCell, TableRow } from '@subql/react-ui/dist/components/Table';
import * as React from 'react';
import { useEraValue } from '../../hooks';
import { GetIndexerDelegators_indexer_delegations_nodes as Delegator } from '../../__generated__/registry/GetIndexerDelegators';
import { IndexerName } from '../IndexerDetails/IndexerName';
import { utils } from 'ethers';

type Props = {
  onClick?: () => void;
  delegator: Delegator;
};

const DelegatorRow: React.FC<Props> = ({ onClick, delegator }) => {
  const stake = useEraValue(delegator.amount);

  return (
    <TableRow onClick={onClick}>
      <TableCell>
        <IndexerName address={delegator.delegatorId} />
      </TableCell>
      <TableCell>
        <Typography>{stake ? utils.formatEther(stake.after ?? stake.current) : '0'}</Typography>
      </TableCell>
      <TableCell>
        {/* TODO consider indexers total stake */}
        <Typography>{stake ? utils.formatEther(stake.current) : '0'}</Typography>
      </TableCell>
    </TableRow>
  );
};

export default DelegatorRow;
