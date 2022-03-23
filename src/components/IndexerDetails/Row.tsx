// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TableRow, TableCell } from '../Table';
import * as React from 'react';
import { GetDeploymentIndexers_deploymentIndexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Progress from './Progress';
import IndexerName from './IndexerName';
import { AsyncData, mapAsync, notEmpty } from '../../utils';
import { useIndexerMetadata } from '../../hooks';
import { IndexerDetails } from '../../models';
import Status from '../Status';
import { Button } from '@subql/react-ui';
import { StatusColor } from '../Status/Status';
import { useDeploymentPlansLazy } from '../../containers';
import { GetDeploymentPlans_plans_nodes as Plan } from '../../__generated__/GetDeploymentPlans';
import { LazyQueryResult } from '@apollo/client';
import PlansTable, { PlansTableProps } from './PlansTable';

type Props = {
  indexer: DeploymentIndexer;
  metadata: AsyncData<IndexerDetails | undefined>;
  targetBlock: number;
  startBlock?: number;
} & PlansTableProps;

export const Row: React.VFC<Props> = ({ indexer, metadata, targetBlock, startBlock, loadPlans, asyncPlans }) => {
  const [showPlans, setShowPlans] = React.useState<boolean>(false);

  const toggleShowPlans = () => setShowPlans((show) => !show);
  return (
    <>
      <TableRow>
        <TableCell>
          <IndexerName name={metadata.data?.name} image={metadata.data?.image} address={indexer.indexerId} />
        </TableCell>
        <TableCell>
          <Progress
            currentBlock={parseInt(indexer.blockHeight.toString(), 10)}
            targetBlock={targetBlock}
            startBlock={startBlock}
          />
        </TableCell>
        <TableCell>
          <Status text={indexer.status} color={indexer.status === 'READY' ? StatusColor.green : undefined} />
        </TableCell>
        <TableCell>
          <Button label="show plans" onClick={toggleShowPlans} />
        </TableCell>
      </TableRow>
      {showPlans && <PlansTable loadPlans={loadPlans} asyncPlans={asyncPlans} />}
    </>
  );
};

const ConnectedRow: React.VFC<Omit<Props, 'metadata' | 'loadPlans' | 'asyncPlans'> & { deploymentId?: string }> = ({
  indexer,
  deploymentId,
  ...rest
}) => {
  const asyncMetadata = useIndexerMetadata(indexer.indexerId);
  const asyncMetadataComplete = mapAsync(
    (metadata): IndexerDetails => ({ ...metadata, url: `${metadata.url}/query/${deploymentId}` }),
    asyncMetadata,
  );

  const [loadDeploymentPlans, deploymentPlans] = useDeploymentPlansLazy({
    deploymentId: deploymentId ?? '',
    address: indexer.indexerId,
  });

  // Get unique plans based on plan id preferring one with a deploymentId set
  const plans = mapAsync(
    (d) =>
      d.plans?.nodes.filter(notEmpty).reduce((acc, v) => {
        const existing = acc.find((p) => p.planTemplate?.id === v.planTemplate?.id);

        if (!existing?.deploymentId) {
          acc.push(v);
        }

        return acc;
      }, [] as Plan[]),
    deploymentPlans,
  ) as LazyQueryResult<Plan[], unknown>;

  return (
    <Row
      {...rest}
      metadata={asyncMetadataComplete}
      indexer={indexer}
      loadPlans={loadDeploymentPlans}
      asyncPlans={plans}
    />
  );
};

export default ConnectedRow;
