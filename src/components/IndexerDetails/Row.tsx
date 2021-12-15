// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TableRow, TableCell } from '../Table';
import * as React from 'react';
import { GetDeploymentIndexers_indexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Progress from './Progress';
import IndexerName from './IndexerName';
import { AsyncData, renderAsync, mapAsync } from '../../utils';
import { useIndexerMetadata } from '../../hooks';
import { IndexerDetails } from '../../models';
import Copy from '../Copy';
import styles from './Row.module.css';
import Spinner from '../Spinner';
import Status from '../Status';
import { Typography } from '@subql/react-ui';

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
      <TableCell>
        <Status text={indexer.status} color={indexer.status === 'READY' ? 'green' : undefined} />
      </TableCell>
      <TableCell>
        {renderAsync(
          mapAsync((d) => d.url, metadata),
          {
            loading: () => <Spinner size={15} />,
            error: (e) => {
              console.log('Failed to get indexer url', e);
              return <Typography className={styles.url}>N/A</Typography>;
            },
            data: (url) => (
              <div className={styles.urlCont}>
                <Typography className={styles.url}>{url ?? 'N/A'}</Typography>
                {url && <Copy value={url} className={styles.copy} />}
              </div>
            ),
          },
        )}
      </TableCell>
    </TableRow>
  );
};

const ConnectedRow: React.VFC<Omit<Props, 'metadata'> & { deploymentId?: string }> = ({
  indexer,
  deploymentId,
  ...rest
}) => {
  const asyncMetadata = useIndexerMetadata(indexer.indexer);
  const asyncMetadataComplete = mapAsync<IndexerDetails>(
    (metadata) => ({ ...metadata, url: `${metadata.url}/query/${deploymentId}` }),
    asyncMetadata,
  );

  return <Row metadata={asyncMetadataComplete} indexer={indexer} {...rest} />;
};

export default ConnectedRow;
