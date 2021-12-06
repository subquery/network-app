// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';
import { GetDeploymentIndexers_indexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Progress from './Progress';
import IndexerName from './IndexerName';
import { AsyncData, renderAsync, mapAsync, mergeAsync } from '../../utils';
import { useIndexerMetadata } from '../../hooks';
import { IndexerDetails } from '../../models';
import Copy from '../Copy';
import styles from './Row.module.css';
import Spinner from '../Spinner';
import { useApiEndpoint } from '../../hooks/useApiEndpoint';

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
      <TableCell>
        {renderAsync(
          mapAsync((d) => d.url, metadata),
          {
            loading: () => <Spinner size={15} />,
            error: (e) => {
              console.log('Failed to get indexer url', e);
              return <p className={styles.url}>N/A</p>;
            },
            data: (url) => (
              <div className={styles.urlCont}>
                <p className={styles.url}>{url ?? 'N/A'}</p>
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

  const asyncUrl = React.useMemo(() => mapAsync((d) => d.url, asyncMetadata), [asyncMetadata]);

  const asyncQueryUrl = useApiEndpoint(asyncUrl.data, deploymentId);

  const asyncMetadataComplete = mapAsync<IndexerDetails>(
    ([metadata, queryUrl]) => ({ ...metadata, url: queryUrl }),
    mergeAsync(asyncMetadata, asyncQueryUrl),
  );

  return <Row metadata={asyncMetadataComplete} indexer={indexer} {...rest} />;
};

export default ConnectedRow;
