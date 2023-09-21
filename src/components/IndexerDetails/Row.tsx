// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronDown, BsChevronUp, BsInfoSquare } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { LazyQueryResult } from '@apollo/client';
import { WalletRoute } from '@components/WalletRoute';
import { useDeploymentStatusOnContract } from '@hooks/useDeploymentStatusOnContract';
import { useIsLogin } from '@hooks/useIsLogin';
import { Modal, Spinner } from '@subql/components';
import { GraphiQL } from '@subql/components/dist/common/GraphiQL';
import { GetDeploymentIndexersQuery, PlansNodeFieldsFragment as Plan } from '@subql/network-query';
import { Status as DeploymentStatus } from '@subql/network-query';
import { useGetDeploymentPlansLazyQuery } from '@subql/react-hooks';
import { getDeploymentStatus } from '@utils/getIndexerStatus';
import { Table, TableProps, Tooltip } from 'antd';
import { Modal as AntdModal, Typography } from 'antd';
import assert from 'assert';
import axios from 'axios';
import clsx from 'clsx';
import { t } from 'i18next';

import { useWeb3Store } from 'src/stores';
import { useProjectStore } from 'src/stores/project';

import { useSQToken, useWeb3 } from '../../containers';
import { useAsyncMemo, useIndexerMetadata } from '../../hooks';
import PlaygroundIcon from '../../images/playground';
import { IndexerDetails } from '../../models';
import {
  cidToBytes32,
  ExcludeNull,
  getAuthReqHeader,
  getDeploymentMetadata,
  mapAsync,
  notEmpty,
  renderAsync,
  requestServiceAgreementToken,
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
};

const ErrorMsg = ({ msg }: { msg: ErrorMsgProps }) => (
  <>
    <Tooltip title={`${t('indexers.tooltip.connection')}${msg.metadata?.url}/metadata/${msg.deploymentId}`}>
      <Typography.Text type="danger">Error: </Typography.Text>
      <Typography.Text type="secondary">{t('indexers.tooltip.error')}</Typography.Text>
    </Tooltip>
  </>
);

const getMaxTargetBlock = (cur: number, max?: number) => Math.max(max ?? 0, cur);
export interface QueryLimit {
  daily_limit: number;
  daily_used: number;
  rate_limit: number;
  rate_used: number;
}

const ConnectedRow: React.FC<{
  indexer: ExcludeNull<ExcludeNull<GetDeploymentIndexersQuery['deploymentIndexers']>['nodes'][number]>;
  deploymentId?: string;
}> = ({ indexer, deploymentId }) => {
  const { t } = useTranslation();
  const { account, library } = useWeb3();
  const navigate = useNavigate();
  const { projectMaxTargetHeightInfoRef, setProjectMaxTargetHeightInfo, projectMaxTargetHeightInfo } =
    useProjectStore();
  const isLogin = useIsLogin();
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
  const [showReqTokenConfirmModal, setShowReqTokenConfirmModal] = React.useState(false);
  const [showPlayground, setShowPlayground] = React.useState(false);
  const [trailToken, setTrailToken] = React.useState('');
  const [trailLimitInfo, setTrailLimitInfo] = React.useState<QueryLimit>();

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

    let maxTargetHeight = projectMaxTargetHeightInfoRef.get(deploymentId) || 0;

    if (!maxTargetHeight || (maxTargetHeight && meta?.targetHeight && meta.targetHeight > maxTargetHeight)) {
      maxTargetHeight = meta?.targetHeight || 0;
      setProjectMaxTargetHeightInfo(deploymentId, maxTargetHeight);
    }

    return {
      startBlock: meta?.startHeight ?? 0,
      targetBlock: maxTargetHeight,
      currentBlock: meta?.lastProcessedHeight ?? 0,
    };
  }, [indexerMetadata.url, indexer]);

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
        <IndexerName
          name={indexerMetadata?.name}
          image={indexerMetadata?.image}
          address={indexer.indexerId}
          onClick={() => {
            navigate(`/indexer/${indexer.indexerId}`);
          }}
        />
      ),
    },
    {
      width: '30%',
      render: () => (
        <>
          {renderAsync(progressInfo, {
            loading: () => <Spinner />,
            error: (error) => <ErrorMsg msg={{ indexer, deploymentId, error, metadata: indexerMetadata }} />,
            data: (info) =>
              info ? (
                <Progress
                  key={indexer.indexerId}
                  {...info}
                  targetBlock={getMaxTargetBlock(info.targetBlock, projectMaxTargetHeightInfo[deploymentId || ''])}
                />
              ) : (
                <Typography>-</Typography>
              ),
          })}
        </>
      ),
    },

    {
      width: '13%',
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
      width: '12%',
      render: () => {
        return (
          <Typography
            style={{
              width: '115px',
              margin: '0 auto',
            }}
            className={styles.playgroundButton}
            onClick={() => {
              setShowReqTokenConfirmModal(true);
            }}
          >
            <PlaygroundIcon color="var(--sq-blue600)" width={14} height={14} style={{ marginRight: '5px' }} />
            Playground
          </Typography>
        );
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
        if (account !== indexer.indexerId) {
          return (
            <div className={styles.planButton}>
              {showPlans ? (
                <BsChevronDown onClick={toggleShowPlans} size="14" className="pointer" />
              ) : (
                <BsChevronUp onClick={toggleShowPlans} size="14" className="pointer" />
              )}
            </div>
          );
        }
        return <></>;
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

  // TODO: migrate all indexer-proxy services.
  const updateQueryLimit = async (domain?: string, token?: string) => {
    if (!domain || !token) return;
    const res = await axios.get<QueryLimit>(`${domain}/query-limit`, {
      headers: getAuthReqHeader(token),
    });
    if (res.data.rate_limit) {
      setTrailLimitInfo(res.data);
      return;
    }
  };

  const requestPlayground = async () => {
    if (account && deploymentId) {
      const res = await requestServiceAgreementToken(
        account,
        library,
        wrapProxyEndpoint(`${indexerMetadata.url}/token`, indexer.indexerId),
        indexer.indexerId,
        '',
        deploymentId,
        true,
      );

      if (res?.data) {
        await updateQueryLimit(indexerMetadata.url, res.data);
        setShowReqTokenConfirmModal(false);
        setTrailToken(res.data);
        setShowPlayground(true);
      }
    }
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

      <Modal
        open={showReqTokenConfirmModal}
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}
        wrapClassName={isLogin ? '' : styles.reqModal}
        width={isLogin ? '520px' : '700px'}
        onOk={() => requestPlayground()}
        onCancel={() => {
          setShowReqTokenConfirmModal(false);
        }}
        title="Request Token"
        submitText="Request Token"
      >
        <WalletRoute
          componentMode
          element={<Typography>{t('explorer.flexPlans.requestToken')}</Typography>}
        ></WalletRoute>
      </Modal>

      <AntdModal
        open={showPlayground}
        onCancel={() => setShowPlayground(false)}
        className={styles.playgroundModal}
        width={1200}
      >
        <div className={styles.playgroundModalHeader}>
          <Typography className={styles.playgroundModalTitle}>
            <PlaygroundIcon style={{ marginRight: '8px' }} />
            {t('myFlexPlans.playground')}
          </Typography>
          <Typography className={styles.playgroundModalLimitInfo}>
            <span style={{ marginRight: 8 }}>
              {t('explorer.flexPlans.remainLimit', {
                limit: `${trailLimitInfo && trailLimitInfo.daily_limit - trailLimitInfo.daily_used}`,
              })}
            </span>
            {/* TODO: now can't get exactly expires time. Will update at next version. */}
            <span>
              {t('explorer.flexPlans.expireTime', {
                time: '24h',
              })}
            </span>
          </Typography>
        </div>
        {queryUrl && trailToken && <GraphiQL url={queryUrl} bearToken={trailToken} theme="dark"></GraphiQL>}
      </AntdModal>
    </>
  );
};

export default ConnectedRow;
