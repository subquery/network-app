// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/components';
import * as React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Table, TableProps, Typography as AntDTypography, Tooltip, Button } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import { Copy, EmptyList, VersionDeployment } from '../../../components';
import { useProjectMetadata, useWeb3 } from '../../../containers';
import { formatEther, mapAsync, notEmpty, renderAsync, renderAsyncArray, wrapProxyEndpoint } from '../../../utils';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useLocation, useNavigate } from 'react-router';
import styles from './ServiceAgreements.module.css';
import { ROUTES } from '../../../utils';
import { useAsyncMemo, useGetIndexerQuery, useGetProjectOngoingServiceAgreementsQuery } from '@subql/react-hooks';
import { ServiceAgreementFieldsFragment } from '@subql/network-query';
import { RenderResult } from '@subql/react-hooks/dist/utils';
import { SA_QUERY_FN } from './ServiceAgreements';
import { TableTitle, TableText } from '@subql/components';

type SAProject = NonNullable<NonNullable<ServiceAgreementFieldsFragment['deployment']>['project']>;

const { INDEXER_SA_NAV, CONSUMER_SA_NAV, CONSUMER_SA_PLAYGROUND_NAV, CONSUMER_SA_ONGOING_NAV, INDEXER_SA_ONGOING_NAV } =
  ROUTES;

export const QueryUrl = ({ indexer, deploymentId }: { indexer: string; deploymentId: string }): RenderResult => {
  const asyncMetadata = useGetIndexerQuery({ variables: { address: indexer } });

  return renderAsync(asyncMetadata, {
    error: () => <Typography>-</Typography>,
    loading: () => <Spinner />,
    data: (data) => {
      const rawUrl = data?.indexer?.metadata?.url;
      const queryUrl = wrapProxyEndpoint(`${rawUrl}/query/${deploymentId}`, indexer);
      return (
        <Copy value={queryUrl} className={styles.copy} iconClassName={styles.copyIcon}>
          <Tooltip title={queryUrl}>
            <AntDTypography.Text ellipsis={true}>{queryUrl ?? '-'}</AntDTypography.Text>
          </Tooltip>
        </Copy>
      );
    },
  });
};

export const Project: React.FC<{ project: SAProject }> = ({ project }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project.metadata, getMetadataFromCid]);

  return <TableText content={metadata.data?.name ?? project.id} />;
};

interface ServiceAgreementsTableProps {
  queryFn: SA_QUERY_FN | typeof useGetProjectOngoingServiceAgreementsQuery;
  queryParams?: { deploymentId?: string; address?: string };
  emptyI18nKey?: string;
}

export const ServiceAgreementsTable: React.FC<ServiceAgreementsTableProps> = ({
  queryFn,
  queryParams,
  emptyI18nKey,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { account } = useWeb3();

  const isOngoingPath = pathname === CONSUMER_SA_ONGOING_NAV || pathname === INDEXER_SA_ONGOING_NAV;

  const columns: TableProps<ServiceAgreementFieldsFragment>['columns'] = [
    {
      dataIndex: 'id',
      title: <TableTitle title={'#'} />,
      width: 40,
      render: (text: string, _: ServiceAgreementFieldsFragment, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'deployment',
      key: 'project',
      title: <TableTitle title={t('serviceAgreements.headers.project')} />,
      width: 150,
      render: (deployment: ServiceAgreementFieldsFragment['deployment']) =>
        deployment?.project && <Project project={deployment.project} />,
    },
    {
      dataIndex: 'deployment',
      title: <TableTitle title={t('serviceAgreements.headers.deployment')} />,
      key: 'deployment',
      width: 200,
      render: (deployment: ServiceAgreementFieldsFragment['deployment']) => (
        <VersionDeployment deployment={deployment} />
      ),
    },
    {
      dataIndex: 'period',
      title: (
        <TableTitle
          title={isOngoingPath ? t('serviceAgreements.headers.expiry') : t('serviceAgreements.headers.expired')}
        />
      ),

      key: 'expiry',
      width: 160,
      render: (_, sa: ServiceAgreementFieldsFragment) => {
        return <TableText content={moment(sa.endTime).utc(true).fromNow()} />;
      },
    },
    {
      dataIndex: 'indexerAddress',
      title: <TableTitle title={t('indexers.head.url')} />,
      key: 'indexer',
      width: 200,
      ellipsis: true,
      render: (indexer: ServiceAgreementFieldsFragment['indexerAddress'], sa: ServiceAgreementFieldsFragment) => (
        <QueryUrl indexer={indexer} deploymentId={sa.deploymentId} />
      ),
    },
    {
      dataIndex: 'lockedAmount',
      title: <TableTitle title={t('serviceAgreements.headers.price')} />,
      key: 'price',
      width: 100,
      render: (price: ServiceAgreementFieldsFragment['lockedAmount']) => (
        <TableText content={`${formatEther(price)} SQT`} />
      ),
    },
  ];

  const playgroundCol = {
    title: <TableTitle title={t('indexer.action')} />,
    dataIndex: 'id',
    key: 'operation',
    fixed: 'right' as FixedType,
    width: 120,
    render: (saId: string, sa: ServiceAgreementFieldsFragment) => {
      if (sa.indexerAddress === account)
        return (
          <Typography variant="small" className="grayText">
            {t('serviceAgreements.playground.comingSoon')}
          </Typography>
        );
      return (
        <Button
          size="middle"
          type={'link'}
          onClick={() => navigate(`${CONSUMER_SA_PLAYGROUND_NAV}/${saId}`, { state: { serviceAgreement: sa } })}
        >
          {t('serviceAgreements.playground.title')}
        </Button>
      );
    },
  };

  const indexerCol = {
    dataIndex: 'indexerAddress',
    title: <TableTitle title={t('serviceAgreements.headers.indexer')} />,
    key: 'indexer',
    width: 200,
    render: (indexer: ServiceAgreementFieldsFragment['indexerAddress']) => <ConnectedIndexer id={indexer} />,
  };

  const consumerCol = {
    dataIndex: 'consumerAddress',
    title: <TableTitle title={t('serviceAgreements.headers.consumer')} />,
    key: 'consumer',
    width: 200,
    render: (consumer: ServiceAgreementFieldsFragment['consumerAddress']) => <ConnectedIndexer id={consumer} />,
  };

  const [now, setNow] = React.useState<Date>(moment().toDate());
  const sortedParams = { deploymentId: queryParams?.deploymentId || '', address: queryParams?.address || '', now };
  const serviceAgreements = queryFn({ variables: sortedParams });
  const [data, setData] = React.useState(serviceAgreements);

  let roleCol;

  if (pathname.startsWith(INDEXER_SA_NAV)) {
    roleCol = consumerCol;
  } else if (pathname.startsWith(CONSUMER_SA_NAV)) {
    roleCol = indexerCol;
  }

  const columnsWithRole = roleCol ? [...columns.slice(0, 3), roleCol, ...columns.slice(3)] : columns;
  const sortedCols = isOngoingPath ? [...columnsWithRole, playgroundCol] : columnsWithRole;

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
          empty: () => (
            <EmptyList
              title={t('serviceAgreements.noOngoingAgreementsTitle')}
              description={t('serviceAgreements.nonOngoingAgreements')}
            />
          ),
          data: (data) => {
            return <Table columns={sortedCols} dataSource={data} scroll={{ x: 1500 }} rowKey={'id'} />;
          },
        },
      )}
    </>
  );
};
