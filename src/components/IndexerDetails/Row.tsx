// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';
import { GetDeploymentIndexers_indexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Progress from './Progress';
import IndexerName from './IndexerName';
import { AsyncData } from '../../utils';
import { useIndexerMetadata } from '../../hooks';
import { IndexerDetails } from '../../models';

type Props = {
  indexer: DeploymentIndexer;
  metadata: AsyncData<IndexerDetails | undefined>;
  targetBlock: number;
  startBlock?: number;
};

export const Row: React.VFC<Props> = ({ indexer, metadata, targetBlock, startBlock }) => {
  return (
    <TableRow>
      <TableCell>
        <IndexerName name={metadata.data?.name} image={metadata.data?.image} address={indexer.indexer} />
      </TableCell>
      <TableCell>
        <Progress
          currentBlock={parseInt(indexer.blockHeight.toString(), 10)}
          targetBlock={targetBlock}
          startBlock={startBlock}
        />
      </TableCell>
      <TableCell>{indexer.status}</TableCell>
      <TableCell>{metadata.data?.endpoint ?? 'N/A'}</TableCell>
    </TableRow>
  );
};

const ConnectedRow: React.VFC<Omit<Props, 'metadata'>> = ({ indexer, ...rest }) => {
  const asyncMetadata = useIndexerMetadata(indexer.indexer);

  return <Row metadata={asyncMetadata} indexer={indexer} {...rest} />;
};

export default ConnectedRow;
