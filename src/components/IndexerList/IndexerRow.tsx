// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import { TableCell, TableRow } from '@subql/react-ui/dist/components/Table';
import * as React from 'react';
import { useEraValue, useIPFSMetadata } from '../../hooks';
import { IndexerDetails, indexerMetadataSchema } from '../../models';
import { AsyncData, mapAsync } from '../../utils';
import { GetIndexers_indexers_nodes as Indexer } from '../../__generated__/GetIndexers';
import IndexerName from '../IndexerDetails/IndexerName';
// import { TableCell } from '@subql/react-ui/dist/components/Table';

// const { TableRow, TableCell} = Table;
import { BigNumber, utils } from 'ethers';
import { currentEraValueToString } from '../../hooks/useEraValue';

type Props = {
  onClick?: () => void;
  indexer: Indexer;
  metadata: AsyncData<IndexerDetails | undefined>;
};

const IndexerRow: React.FC<Props> = ({ onClick, metadata, indexer }) => {
  const stake = useEraValue(indexer.totalStake);
  const commission = useEraValue(indexer.commission);

  const stakeString = React.useMemo(() => (stake ? currentEraValueToString(stake, utils.formatEther) : ''), [stake]);
  const commissionString = React.useMemo(
    () =>
      commission
        ? currentEraValueToString(commission, (value) => (BigNumber.from(value).toNumber() / 10).toFixed(2))
        : '',
    [commission],
  );

  return (
    <TableRow onClick={onClick}>
      <TableCell>
        <IndexerName name={metadata.data?.name} image={metadata.data?.image} address={indexer.id} />
      </TableCell>
      <TableCell>
        <Typography>{`${stakeString} SQT`}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{`${commissionString} %`}</Typography>
      </TableCell>
    </TableRow>
  );
};

const ConnectedIndexerRow: React.FC<Omit<Props, 'metadata'>> = (props) => {
  const asyncMetadata = useIPFSMetadata<IndexerDetails>(props.indexer.metadata);
  const metadata = mapAsync((meta) => indexerMetadataSchema.validateSync(meta), asyncMetadata);

  return <IndexerRow {...props} metadata={metadata} />;
};

export default ConnectedIndexerRow;
