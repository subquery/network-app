// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsDashSquare, BsInfoSquare, BsPlusSquare } from 'react-icons/bs';
import { LazyQueryResult } from '@apollo/client';
import { useDeploymentStatusOnContract } from '@hooks/useDeploymentStatusOnContract';
import { Spinner } from '@subql/components';
import { GetDeploymentIndexersQuery, PlansNodeFieldsFragment as Plan } from '@subql/network-query';
import { Status as DeploymentStatus } from '@subql/network-query';
import { getDeploymentStatus } from '@utils/getIndexerStatus';
import { Table, TableProps, Tooltip } from 'antd';
import { Typography } from 'antd';
import assert from 'assert';
import clsx from 'clsx';
import { TFunction } from 'i18next';

import { useWeb3Store } from 'src/stores';

import { useDeploymentPlansLazy, useSQToken, useWeb3 } from '../../containers';
import { useAsyncMemo, useIndexerMetadata } from '../../hooks';
import { IndexerDetails } from '../../models';
import {
  AsyncData,
  cidToBytes32,
  ExcludeNull,
  getDeploymentMetadata,
  mapAsync,
  notEmpty,
  renderAsync,
  wrapProxyEndpoint,
} from '../../utils';
import Copy from '../Copy';
import Status from '../Status';
import { deploymentStatus } from '../Status/Status';
import styles from './IndexerDetails.module.css';
import { IndexerName } from './IndexerName';
import { PlansTable, PlansTableProps } from './PlansTable';
import Progress from './Progress';

type ErrorMsgProps = {
  indexer: ExcludeNull<GetDeploymentIndexersQuery['deploymentIndexers']>['nodes'][number];
  deploymentId: string | undefined;
  metadata: IndexerDetails;
  error: Error;
  t: TFunction;
};

const ErrorMsg = ({ msg }: { msg: ErrorMsgProps }) => (
  <>
    <Tooltip title={`${msg.t('indexers.tooltip.connection')}${msg.metadata?.url}/metadata/${msg.deploymentId}`}>
      <Typography.Text type="danger">Error: </Typography.Text>
      <Typography.Text type="secondary">{msg.t('indexers.tooltip.error')}</Typography.Text>
    </Tooltip>
  </>
);

type Props = {
  indexer: ExcludeNull<ExcludeNull<GetDeploymentIndexersQuery['deploymentIndexers']>['nodes'][number]>;
  metadata: IndexerDetails;
  progressInfo: AsyncData<{
    currentBlock: number;
    targetBlock: number;
    startBlock?: number;
  } | null>;
} & PlansTableProps;

export const Row: React.FC<Props> = ({ indexer, metadata, progressInfo, deploymentId, ...plansTableProps }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const [showPlans, setShowPlans] = React.useState<boolean>(false);

  const isOfflineDeploymentOnContract = useDeploymentStatusOnContract(indexer.indexerId, deploymentId);

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
      render: () => <IndexerName name={metadata?.name} image={metadata?.image} address={indexer.indexerId} />,
    },
    {
      width: '30%',
      render: () => (
        <>
          {renderAsync(progressInfo, {
            loading: () => <Spinner />,
            error: (error) => <ErrorMsg msg={{ indexer, deploymentId, error, t, metadata }} />,
            data: (info) => (info ? <Progress {...info} /> : <Typography>-</Typography>),
          })}
        </>
      ),
    },

    {
      width: '15%',
      render: () => {
        return renderAsync(isOfflineDeploymentOnContract, {
          error: (error) => <Status text="Error" color={deploymentStatus.NOTINDEXING} />,
          loading: () => <Spinner />,
          data: (data) => {
            const sortedStatus = getDeploymentStatus(indexer.status, data);
            return <Status text={sortedStatus} color={deploymentStatus[sortedStatus]} />;
          },
        });
      },
    },
    {
      width: '30%',
      ellipsis: true,
      render: () => (
        <>
          <Copy value={metadata?.url} className={styles.copy} iconClassName={styles.copyIcon}>
            <Tooltip title={metadata?.url}>
              <Typography.Text ellipsis={true}>{metadata?.url ?? '-'}</Typography.Text>
            </Tooltip>
          </Copy>
        </>
      ),
    },
    {
      width: '5%',
      dataIndex: 'status',
      render: (status: string) => {
        if (status !== DeploymentStatus.READY) {
          return (
            <Tooltip overlay={t('plans.purchase.notReadyToBePurchased')}>
              <BsInfoSquare size="20" className={clsx('pointer', 'grayText')} />
            </Tooltip>
          );
        }
        return (
          account !== indexer.indexerId &&
          (showPlans ? (
            <BsDashSquare onClick={toggleShowPlans} size="20" className="pointer" />
          ) : (
            <BsPlusSquare onClick={toggleShowPlans} size="20" className="pointer" />
          ))
        );
      },
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
      {showPlans && <PlansTable {...plansTableProps} deploymentId={''} indexerDetails={metadata} />}
    </>
  );
};

const ConnectedRow: React.FC<
  Omit<
    Props,
    'metadata' | 'loadPlans' | 'asyncPlans' | 'purchasePlan' | 'balance' | 'planManagerAllowance' | 'progressInfo'
  > & {
    deploymentId?: string;
    startBlock?: number;
  }
> = ({ indexer, deploymentId, startBlock, ...rest }) => {
  const { balance, planAllowance } = useSQToken();
  const { contracts } = useWeb3Store();
  const metadata = useIndexerMetadata(indexer.indexerId);

  const [loadDeploymentPlans, deploymentPlans] = useDeploymentPlansLazy({
    deploymentId: deploymentId ?? '',
    address: indexer.indexerId,
  });

  const metadataComplete = {
    ...metadata,
    url: wrapProxyEndpoint(`${metadata?.url}/query/${deploymentId}`, indexer.indexerId),
  };

  // Get unique plans based on plan id preferring one with a deploymentId set
  const plans = mapAsync((d) => {
    const plans = d.plans?.nodes.filter(notEmpty) ?? [];

    const deploymentPlans = plans.filter((p) => p.deploymentId === deploymentId);

    if (deploymentPlans.length) {
      return deploymentPlans;
    }

    return plans.filter((p) => !p.deploymentId);
  }, deploymentPlans) as LazyQueryResult<Plan[], any>;

  const purchasePlan = async (indexer: string, planId?: string) => {
    assert(contracts, 'Contracts not available');
    assert(deploymentId, 'DeploymentId not provided');
    assert(planId, 'planId not provided');

    return contracts.planManager.acceptPlan(planId, cidToBytes32(deploymentId));
  };

  const progressInfo = useAsyncMemo(async () => {
    // TODO: Need thinking, this seems not robust.
    if (!deploymentId || !metadata?.url) {
      return null;
    }

    const meta = await getDeploymentMetadata({
      proxyEndpoint: metadata?.url,
      deploymentId,
      indexer: indexer.indexerId,
    });

    return {
      startBlock,
      targetBlock: meta?.targetHeight ?? 0,
      currentBlock: meta?.lastProcessedHeight ?? 0,
    };
  }, [startBlock, metadata.url, indexer]);

  return (
    <Row
      {...rest}
      metadata={metadataComplete}
      indexer={indexer}
      loadPlans={loadDeploymentPlans}
      asyncPlans={plans}
      purchasePlan={purchasePlan}
      balance={balance}
      planManagerAllowance={planAllowance}
      progressInfo={progressInfo}
      deploymentId={deploymentId}
    />
  );
};

export default ConnectedRow;
