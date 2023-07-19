// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronDown, BsChevronUp, BsInfoSquare } from 'react-icons/bs';
import { LazyQueryResult } from '@apollo/client';
import { useDeploymentStatusOnContract } from '@hooks/useDeploymentStatusOnContract';
import { Spinner } from '@subql/components';
import { GetDeploymentIndexersQuery, PlansNodeFieldsFragment as Plan } from '@subql/network-query';
import { Status as DeploymentStatus } from '@subql/network-query';
import { useGetDeploymentPlansLazyQuery } from '@subql/react-hooks';
import { getDeploymentStatus } from '@utils/getIndexerStatus';
import { Table, TableProps, Tooltip } from 'antd';
import { Typography } from 'antd';
import assert from 'assert';
import clsx from 'clsx';
import { TFunction } from 'i18next';

import { useWeb3Store } from 'src/stores';

import { useSQToken, useWeb3 } from '../../containers';
import { useAsyncMemo, useIndexerMetadata } from '../../hooks';
import { IndexerDetails } from '../../models';
import {
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
import styles from './IndexerDetails.module.less';
import { IndexerName } from './IndexerName';
import { PlansTable } from './PlansTable';
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

const ConnectedRow: React.FC<{
  indexer: ExcludeNull<ExcludeNull<GetDeploymentIndexersQuery['deploymentIndexers']>['nodes'][number]>;
  deploymentId?: string;
  startBlock?: number;
}> = ({ indexer, deploymentId, startBlock }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { balance, planAllowance } = useSQToken();
  const { contracts } = useWeb3Store();
  const { indexerMetadata } = useIndexerMetadata(indexer.indexerId);
  const isOfflineDeploymentOnContract = useDeploymentStatusOnContract(indexer.indexerId, deploymentId);
  const [loadDeploymentPlans, deploymentPlans] = useGetDeploymentPlansLazyQuery({
    variables: {
      deploymentId: deploymentId ?? '',
      address: indexer.indexerId,
    },
  });

  const [showPlans, setShowPlans] = React.useState<boolean>(false);

  const queryUrl = React.useMemo(() => {
    return wrapProxyEndpoint(`${indexerMetadata.url}/query/${deploymentId}`, indexer.indexerId);
  }, [indexerMetadata, deploymentId, indexer.indexer]);

  const progressInfo = useAsyncMemo(async () => {
    // TODO: Need thinking, this seems not robust.
    if (!deploymentId || !indexerMetadata?.url) {
      return null;
    }

    const meta = await getDeploymentMetadata({
      proxyEndpoint: indexerMetadata?.url,
      deploymentId,
      indexer: indexer.indexerId,
    });

    return {
      startBlock,
      targetBlock: meta?.targetHeight ?? 0,
      currentBlock: meta?.lastProcessedHeight ?? 0,
    };
  }, [startBlock, indexerMetadata.url, indexer]);

  const rowData = [
    {
      id: indexer.indexerId,
      progressInfo: progressInfo,
      status: indexer.status,
    },
  ];

  const columns: TableProps<(typeof rowData)[number]>['columns'] = [
    {
      width: '20%',
      render: () => (
        <IndexerName name={indexerMetadata?.name} image={indexerMetadata?.image} address={indexer.indexerId} />
      ),
    },
    {
      width: '30%',
      render: () => (
        <>
          {renderAsync(progressInfo, {
            loading: () => <Spinner />,
            error: (error) => <ErrorMsg msg={{ indexer, deploymentId, error, t, metadata: indexerMetadata }} />,
            data: (info) => (info ? <Progress key={indexer.indexerId} {...info} /> : <Typography>-</Typography>),
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
      width: '20%',
      ellipsis: true,
      render: () => (
        <>
          <Copy value={queryUrl} className={styles.copy} iconClassName={styles.copyIcon}>
            <Tooltip title={queryUrl}>
              <Typography.Text ellipsis={true}>{queryUrl ?? '-'}</Typography.Text>
            </Tooltip>
          </Copy>
        </>
      ),
    },
    {
      width: '10%',
      render: () => {
        return <Typography className={styles.playgroundButton}>Playground</Typography>;
      },
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
          <div className={styles.planButton}>
            {account !== indexer.indexerId &&
              (showPlans ? (
                <BsChevronDown onClick={toggleShowPlans} size="14" className="pointer" />
              ) : (
                <BsChevronUp onClick={toggleShowPlans} size="14" className="pointer" />
              ))}
          </div>
        );
      },
    },
  ];

  const toggleShowPlans = () => setShowPlans((show) => !show);

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

  return (
    <>
      <Table columns={columns} dataSource={rowData} showHeader={false} pagination={false} rowKey="id" />
      {showPlans && (
        <PlansTable
          balance={balance}
          planManagerAllowance={planAllowance}
          purchasePlan={purchasePlan}
          loadPlans={loadDeploymentPlans}
          asyncPlans={plans}
          deploymentId={''}
          indexerDetails={indexerMetadata}
        />
      )}
    </>
  );
};

export default ConnectedRow;
