// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, TableProps } from 'antd';
import * as React from 'react';
import { GetDeploymentIndexers_deploymentIndexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Progress from './Progress';
import IndexerName from './IndexerName';
import {
  AsyncData,
  cidToBytes32,
  getDeploymentMetadata,
  mapAsync,
  notEmpty,
  renderAsync,
  wrapProxyEndpoint,
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
import { BsPlusSquare, BsDashSquare } from 'react-icons/bs';
import { Typography } from 'antd';
import Copy from '../Copy';
import styles from './IndexerDetails.module.css';

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
      width: '30%',
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
      width: '20%',
      align: 'center',
      ellipsis: true,
      render: () =>
        renderAsync(metadata, {
          error: () => <Typography>-</Typography>,
          loading: () => <Spinner />,
          data: (data) => (
            <div className={styles.addressCont}>
              <Typography.Text ellipsis={true}>{data?.url ?? '-'}</Typography.Text>
              <Copy value={data?.url} className={styles.copy} iconClassName={styles.copyIcon} />
            </div>
          ),
        }),
    },
    {
      width: '10%',
      align: 'center',
      render: () =>
        account !== indexer.indexerId &&
        (showPlans ? (
          <BsDashSquare onClick={toggleShowPlans} size="20" className="pointer" />
        ) : (
          <BsPlusSquare onClick={toggleShowPlans} size="20" className="pointer" />
        )),
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
  const { updateIndexerStatus } = useProjectProgress();
  const { balance, planAllowance } = useSQToken();
  const pendingContracts = useContracts();
  const asyncMetadata = useIndexerMetadata(indexer.indexerId);

  const [loadDeploymentPlans, deploymentPlans] = useDeploymentPlansLazy({
    deploymentId: deploymentId ?? '',
    address: indexer.indexerId,
  });

  const asyncMetadataComplete = mapAsync(
    (metadata): IndexerDetails => ({
      ...metadata,
      url: wrapProxyEndpoint(`${metadata.url}/query/${deploymentId}`, indexer.indexerId),
    }),
    asyncMetadata,
  );

  // Get unique plans based on plan id preferring one with a deploymentId set
  const plans = mapAsync((d) => {
    const plans = d.plans?.nodes.filter(notEmpty) ?? [];

    const deploymentPlans = plans.filter((p) => p.deploymentId === deploymentId);

    if (deploymentPlans.length) {
      return deploymentPlans;
    }

    return plans.filter((p) => !p.deploymentId);
  }, deploymentPlans) as LazyQueryResult<Plan[], unknown>;

  const purchasePlan = async (indexer: string, planId?: string) => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(deploymentId, 'DeploymentId not provided');
    assert(planId, 'planId not provided');

    return contracts.planManager.acceptPlan(indexer, cidToBytes32(deploymentId), planId);
  };

  const progressInfo = useAsyncMemo(async () => {
    if (!deploymentId || !asyncMetadata.data?.url) {
      return null;
    }

    const meta = await getDeploymentMetadata({
      proxyEndpoint: asyncMetadata.data?.url,
      deploymentId,
      indexer: indexer.indexerId,
    });

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
