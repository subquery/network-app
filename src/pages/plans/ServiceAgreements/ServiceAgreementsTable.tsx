// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, TableProps, Typography as AntDTypography, Tooltip } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import { Copy, TableText, VersionDeployment } from '../../../components';
import { useProjectMetadata, useServiceAgreements, useSpecificServiceAgreements, useWeb3 } from '../../../containers';
import { formatEther, mapAsync, notEmpty, renderAsync, renderAsyncArray, wrapProxyEndpoint } from '../../../utils';
import {
  GetOngoingServiceAgreements_serviceAgreements_nodes as ServiceAgreement,
  GetOngoingServiceAgreements_serviceAgreements_nodes_deployment_project as SAProject,
} from '../../../__generated__/registry/GetOngoingServiceAgreements';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useAsyncMemo, useIndexerMetadata } from '../../../hooks';
import { EmptyList } from '../Plans/EmptyList';
import { useLocation } from 'react-router';
import { ONGOING_PLANS, PLAYGROUND } from './ServiceAgreements';
import styles from './ServiceAgreements.module.css';

export const QueryUrl = ({ indexer, deploymentId }: { indexer: string; deploymentId: string }) => {
  const asyncMetadata = useIndexerMetadata(indexer);

  return renderAsync(asyncMetadata, {
    error: () => <Typography>-</Typography>,
    loading: () => <Spinner />,
    data: (data) => {
      const rawUrl = data?.url;
      const queryUrl = wrapProxyEndpoint(`${rawUrl}/query/${deploymentId}`, indexer);
      return (
        <Copy value={queryUrl} className={styles.copy} iconClassName={styles.copyIcon}>
          <div className={styles.addressCont}>
            <Tooltip title={queryUrl}>
              <AntDTypography.Text ellipsis={true}>{queryUrl ?? '-'}</AntDTypography.Text>
            </Tooltip>
          </div>
        </Copy>
      );
    },
  });
};

export const Project: React.VFC<{ project: SAProject }> = ({ project }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project.metadata, getMetadataFromCid]);

  return <TableText content={metadata.data?.name ?? project.id} />;
};

interface ServiceAgreementsTableProps {
  queryFn: typeof useServiceAgreements | typeof useSpecificServiceAgreements;
  queryParams?: { deploymentId?: string; address?: string };
}

export const ServiceAgreementsTable: React.VFC<ServiceAgreementsTableProps> = ({ queryFn, queryParams }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { account } = useWeb3();

  const columns: TableProps<ServiceAgreement>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 40,
      render: (text: string, _: ServiceAgreement, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'deployment',
      key: 'project',
      title: t('serviceAgreements.headers.project').toUpperCase(),
      width: 150,
      render: (deployment: ServiceAgreement['deployment']) =>
        deployment?.project && <Project project={deployment.project} />,
    },
    {
      dataIndex: 'deployment',
      title: t('serviceAgreements.headers.deployment').toUpperCase(),
      key: 'deployment',
      width: 200,
      render: (deployment: ServiceAgreement['deployment']) => <VersionDeployment deployment={deployment} />,
    },
    {
      dataIndex: 'consumerAddress',
      title: t('serviceAgreements.headers.consumer').toUpperCase(),
      key: 'consumer',
      width: 200,
      render: (consumer: ServiceAgreement['consumerAddress']) => <ConnectedIndexer id={consumer} />,
    },
    {
      dataIndex: 'indexerAddress',
      title: t('serviceAgreements.headers.indexer').toUpperCase(),
      key: 'indexer',
      width: 200,
      render: (indexer: ServiceAgreement['indexerAddress']) => <ConnectedIndexer id={indexer} />,
    },
    {
      dataIndex: 'period',
      title:
        pathname === ONGOING_PLANS
          ? t('serviceAgreements.headers.expiry').toUpperCase()
          : t('serviceAgreements.headers.expired').toUpperCase(),
      key: 'expiry',
      width: 160,
      render: (_, sa: ServiceAgreement) => {
        return <TableText content={moment(sa.endTime).utc(true).fromNow()} />;
      },
    },
    {
      dataIndex: 'indexerAddress',
      title: t('indexers.head.url').toUpperCase(),
      key: 'indexer',
      width: 200,
      render: (indexer: ServiceAgreement['indexerAddress'], sa: ServiceAgreement) => (
        <QueryUrl indexer={indexer} deploymentId={sa.deploymentId} />
      ),
    },
    {
      dataIndex: 'lockedAmount',
      title: t('serviceAgreements.headers.price').toUpperCase(),
      key: 'price',
      width: 100,
      render: (price: ServiceAgreement['lockedAmount']) => <TableText content={`${formatEther(price)} SQT`} />,
    },
  ];

  const playgroundCol = {
    title: t('indexer.action').toUpperCase(),
    dataIndex: 'id',
    key: 'operation',
    fixed: 'right' as FixedType,
    width: 120,
    render: (saId: string, sa: ServiceAgreement) => {
      if (sa.indexerAddress === account)
        return (
          <Typography variant="small" className="grayText">
            {t('serviceAgreements.playground.comingSoon')}
          </Typography>
        );
      return (
        <Link
          to={{
            pathname: `${PLAYGROUND}/${saId}`,
            state: { serviceAgreement: sa },
          }}
        >
          {t('serviceAgreements.playground.title')}
        </Link>
      );
    },
  };

  const [now, setNow] = React.useState<Date>(moment().toDate());
  const sortedParams = { deploymentId: queryParams?.deploymentId || '', address: queryParams?.address || '', now };
  const serviceAgreements = queryFn(sortedParams);
  const [data, setData] = React.useState(serviceAgreements);

  const sortedCols = pathname === ONGOING_PLANS ? [...columns, playgroundCol] : columns;

  // NOTE: Every 5min to query wit a new timestamp
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().toDate());
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // NOTE: Every 5min to query wit a new timestamp, manual set cache data which is similar to cache-network fetch policy
  React.useEffect(() => {
    if (serviceAgreements.loading === true && serviceAgreements.previousData) {
      setData({ ...serviceAgreements, data: serviceAgreements.previousData });
      serviceAgreements.data = serviceAgreements.previousData;
    } else {
      setData({ ...serviceAgreements });
    }
  }, [serviceAgreements, serviceAgreements.loading]);

  return (
    <>
      {renderAsyncArray(
        mapAsync((d) => d.serviceAgreements?.nodes.filter(notEmpty), data),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load user service agreements: ${e}`}</Typography>,
          empty: () => <EmptyList i18nKey={'serviceAgreements.non'} />,
          data: (data) => {
            return <Table columns={sortedCols} dataSource={data} scroll={{ x: 1500 }} rowKey={'id'} />;
          },
        },
      )}
    </>
  );
};
