// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { TableRow, TableCell } from '../Table';
import { Table, TableProps } from 'antd';
import * as React from 'react';
import { GetDeploymentIndexers_deploymentIndexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Progress from './Progress';
import IndexerName from './IndexerName';
import {
  AsyncData,
  cidToBytes32,
  getDeploymentMetadata,
  getDeploymentProgress,
  mapAsync,
  notEmpty,
  renderAsync,
} from '../../utils';
import { useAsyncMemo, useIndexerMetadata } from '../../hooks';
import { IndexerDetails } from '../../models';
import Status from '../Status';
import { Spinner } from '@subql/react-ui';
import { deploymentStatus } from '../Status/Status';
import { useContracts, useDeploymentPlansLazy, useProjectProgress, useSQToken, useWeb3 } from '../../containers';
import { GetDeploymentPlans_plans_nodes as Plan } from '../../__generated__/GetDeploymentPlans';
import { LazyQueryResult } from '@apollo/client';
import PlansTable, { PlansTableProps } from './PlansTable';
import assert from 'assert';
import { BsPlusSquare } from 'react-icons/bs';
import { Typography } from 'antd';

type Props = {
  indexer: DeploymentIndexer;
  metadata: AsyncData<IndexerDetails | undefined>;
  progressInfo: AsyncData<{
    currentBlock: number;
    targetBlock: number;
    startBlock?: number;
  } | null>;
} & PlansTableProps;

export const Row: React.VFC<Props> = ({ indexer, metadata, progressInfo, ...plansTableProps }) => {
  // console.log('progressInfo', progressInfo);
  const { account } = useWeb3();
  const [showPlans, setShowPlans] = React.useState<boolean>(false);

  const toggleShowPlans = () => setShowPlans((show) => !show);
  const rowData = [
    {
      id: indexer.indexerId,
      progressInfo: progressInfo,
      status: indexer.status,
    },
  ];

  const columns: TableProps<any>['columns'] = [
    {
      width: '20%',
      align: 'center',
      render: () => <IndexerName name={metadata.data?.name} image={metadata.data?.image} address={indexer.indexerId} />,
    },
    {
      width: '50%',
      align: 'center',
      render: () => (
        <>
          {renderAsync(progressInfo, {
            loading: () => <Spinner />,
            error: () => <Typography>-</Typography>,
            data: (info) => (info ? <Progress {...info} /> : <Typography>No progress available.</Typography>),
          })}
        </>
      ),
    },
    {
      width: '20%',
      align: 'center',
      render: () => <Status text={indexer.status} color={deploymentStatus[indexer.status] ?? undefined} />,
    },
    {
      width: '10%',
      align: 'center',
      render: () => account !== indexer.indexerId && <BsPlusSquare onClick={toggleShowPlans} size="20" />,
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        // expandable={{ rowExpandable: () => true, expandedRowRender }}
        dataSource={rowData}
        showHeader={false}
        pagination={false}
        rowKey="id"
      />
      {showPlans && <PlansTable {...plansTableProps} deploymentId={''} indexerDetails={metadata.data} />}
    </>
  );
};

const ConnectedRow: React.VFC<
  Omit<
    Props,
    'metadata' | 'loadPlans' | 'asyncPlans' | 'purchasePlan' | 'balance' | 'planManagerAllowance' | 'progressInfo'
  > & {
    deploymentId?: string;
    startBlock?: number;
  }
> = ({ indexer, deploymentId, startBlock, ...rest }) => {
  const asyncMetadata = useIndexerMetadata(indexer.indexerId);
  const asyncMetadataComplete = mapAsync(
    (metadata): IndexerDetails => ({ ...metadata, url: `${metadata.url}/query/${deploymentId}` }),
    asyncMetadata,
  );

  const [loadDeploymentPlans, deploymentPlans] = useDeploymentPlansLazy({
    deploymentId: deploymentId ?? '',
    address: indexer.indexerId,
  });

  const { updateIndexerStatus } = useProjectProgress();

  const { balance, planAllowance } = useSQToken();

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

  const pendingContracts = useContracts();

  const purchasePlan = async (indexer: string, planId: string) => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(deploymentId, 'DeploymentId not provided');

    return contracts.planManager.acceptPlan(indexer, cidToBytes32(deploymentId), planId);
  };

  const progressInfo = useAsyncMemo(async () => {
    if (!deploymentId || !asyncMetadata.data?.url) {
      return null;
    }

    const meta = await getDeploymentMetadata({ proxyEndpoint: asyncMetadata.data?.url, deploymentId });

    // Update container to show total progress
    if (meta) {
      updateIndexerStatus(indexer.id, meta.lastProcessedHeight, meta.targetHeight);
    }

    return {
      startBlock,
      targetBlock: meta?.targetHeight ?? 0,
      currentBlock: meta?.lastProcessedHeight ?? 0,
    };
  }, [asyncMetadata?.data, startBlock]);

  return (
    <Row
      {...rest}
      metadata={asyncMetadataComplete}
      indexer={indexer}
      loadPlans={loadDeploymentPlans}
      asyncPlans={plans}
      purchasePlan={purchasePlan}
      balance={balance}
      planManagerAllowance={planAllowance}
      progressInfo={progressInfo}
    />
  );
};

export default ConnectedRow;
