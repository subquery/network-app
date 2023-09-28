// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useStableCoin } from '@hooks/useStableCoin';
import { Spinner, Typography } from '@subql/components';
import { TableText, TableTitle } from '@subql/components';
import { ServiceAgreementFieldsFragment } from '@subql/network-query';
import { useAsyncMemo, useGetProjectOngoingServiceAgreementsQuery } from '@subql/react-hooks';
import { Button, Table, TableProps } from 'antd';
import moment from 'moment';
import { FixedType } from 'rc-table/lib/interface';

import { DeploymentMeta, EmptyList } from '../../../components';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import { useProjectMetadata, useWeb3 } from '../../../containers';
import { mapAsync, notEmpty, renderAsyncArray, TOKEN } from '../../../utils';
import { ROUTES } from '../../../utils';
import { SA_QUERY_FN } from './ServiceAgreements';

type SAProject = NonNullable<NonNullable<ServiceAgreementFieldsFragment['deployment']>['project']>;

const { INDEXER_SA_NAV, CONSUMER_SA_NAV, CONSUMER_SA_PLAYGROUND_NAV, CONSUMER_SA_ONGOING_NAV, INDEXER_SA_ONGOING_NAV } =
  ROUTES;

export const Project: React.FC<{ project: SAProject }> = ({ project }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project.metadata, getMetadataFromCid]);

  return <TableText content={metadata.data?.name ?? project.id} />;
};

interface ServiceAgreementsTableProps {
  queryFn: SA_QUERY_FN | typeof useGetProjectOngoingServiceAgreementsQuery;
  queryParams?: { deploymentId?: string; address?: string };
}

export const ServiceAgreementsTable: React.FC<ServiceAgreementsTableProps> = ({ queryFn, queryParams }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { account } = useWeb3();
  const { transPrice } = useStableCoin();

  const isOngoingPath = pathname === CONSUMER_SA_ONGOING_NAV || pathname === INDEXER_SA_ONGOING_NAV;

  const columns: TableProps<ServiceAgreementFieldsFragment>['columns'] = [
    {
      dataIndex: ['deployment', 'id'],
      key: 'deploymentId',
      title: <TableTitle title={t('myOffers.table.versionDeployment')} />,
      width: 480,
      render: (deploymentId: string, offer) => (
        <DeploymentMeta deploymentId={deploymentId} projectMetadata={offer.deployment?.project?.metadata} />
      ),
    },
    {
      dataIndex: 'id',
      key: 'id',
      title: <TableTitle title={'ID'} />,
      width: 40,
      render: (text: string, _: ServiceAgreementFieldsFragment, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'consumerAddress',
      key: 'Consumer',
      title: <TableTitle title={t('serviceAgreements.headers.consumer')} />,
      width: 150,
      render: (consumer: string) => <ConnectedIndexer id={consumer}></ConnectedIndexer>,
    },
    {
      dataIndex: 'indexerAddress',
      title: <TableTitle title={t('serviceAgreements.headers.indexer')} />,
      key: 'Indexer',
      width: 200,
      render: (indexer: string) => (
        <ConnectedIndexer
          id={indexer}
          onClick={() => {
            navigate(`/indexer/${indexer}`);
          }}
        ></ConnectedIndexer>
      ),
    },
    {
      dataIndex: 'startTime',
      title: <TableTitle title={t('serviceAgreements.headers.startDate')} />,
      key: 'StartDate',
      width: 200,
      render: (startTime: number) => <div>{moment(startTime).utc(true).format('YYYY-MM-DD hh:mm')}</div>,
    },
    {
      // TODO: check the type definition.
      // sorter can be a function, maybe update in new version, feature works good.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sorter: (a, b) => {
        return +new Date(a.endTime) > +new Date(b.endTime);
      },
      dataIndex: 'ExpiryDate',
      key: 'ExpiryDate',
      title: (
        <TableTitle
          title={isOngoingPath ? t('serviceAgreements.headers.expiry') : t('serviceAgreements.headers.expired')}
        />
      ),
      width: 160,
      render: (_, sa: ServiceAgreementFieldsFragment) => {
        return <TableText content={moment(sa.endTime).utc(true).fromNow()} />;
      },
    },
    {
      dataIndex: 'lockedAmount',
      title: <TableTitle title={t('serviceAgreements.headers.price')} />,
      key: 'price',
      width: 100,
      render: (price: ServiceAgreementFieldsFragment['lockedAmount'], record) => (
        <TableText content={`${transPrice(record.planTemplate?.priceToken, price).sqtPrice} ${TOKEN}`} />
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
          onClick={() => {
            navigate(`${CONSUMER_SA_PLAYGROUND_NAV}/${saId}`, { state: { serviceAgreement: sa } });
          }}
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
    render: (indexer: ServiceAgreementFieldsFragment['indexerAddress']) => (
      <ConnectedIndexer
        id={indexer}
        onClick={() => {
          navigate(`/indexer/${indexer}`);
        }}
      />
    ),
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
  // TODO pagination ? not very sure.
  const serviceAgreements = queryFn({ variables: sortedParams });
  const [data, setData] = React.useState(serviceAgreements);

  const columnsWithRole = React.useMemo(() => {
    if (!columns) return [];
    let roleCol: typeof indexerCol | undefined;

    if (pathname.startsWith(INDEXER_SA_NAV)) {
      roleCol = consumerCol;
    } else if (pathname.startsWith(CONSUMER_SA_NAV)) {
      roleCol = indexerCol;
    }
    // TODO think a better way to do.
    return roleCol ? [columns[0], roleCol, ...columns.slice(4)] : columns;
  }, [columns, pathname, consumerCol, indexerCol]);

  const sortedCols = React.useMemo(() => {
    return isOngoingPath ? [...columnsWithRole, playgroundCol] : columnsWithRole;
  }, [isOngoingPath, columnsWithRole, playgroundCol]);

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
