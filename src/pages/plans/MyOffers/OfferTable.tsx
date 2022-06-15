// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@subql/react-ui';
import * as React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Table, TableProps, Typography, Tooltip } from 'antd';
import { Copy, DeploymentInfo, DeploymentMeta, TableText } from '../../../components';
import {
  useAllOpenOffers,
  useOwnExpiredOffers,
  useOwnFinishedOffers,
  useOwnOpenOffers,
  useWeb3,
} from '../../../containers';
import {
  convertBigNumberToNumber,
  formatEther,
  formatSeconds,
  mapAsync,
  notEmpty,
  renderAsyncArray,
} from '../../../utils';
import { GetOwnOpenOffers_offers_nodes as Offers } from '../../../__generated__/registry/GetOwnOpenOffers';
import { EmptyList } from '../Plans/EmptyList';
import { useLocation } from 'react-router';

// TODO: Custom cols based on offer status
const getColumns = () => {
  const idColumns: TableProps<Offers>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 40,
      render: (_: string, __: Offers, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: 'deploymentId',
      title: i18next.t('myOffers.table.versionDeployment').toUpperCase(),
      width: 100,
      render: (deploymentId: string) => <DeploymentInfo deploymentId={deploymentId} />,
    },
  ];

  const generalColumns: TableProps<Offers>['columns'] = [
    {
      title: i18next.t('myOffers.table.indexerAmount').toUpperCase(),
      children: [
        {
          title: i18next.t('myOffers.table.accepted').toUpperCase(),
          dataIndex: 'accepted',
          render: (accepted: number) => <TableText content={accepted} />,
        },
        {
          title: i18next.t('myOffers.table.cap').toUpperCase(),
          dataIndex: 'limit',
          render: (limit: number) => <TableText content={limit} />,
        },
      ],
    },
    {
      dataIndex: ['planTemplate', 'period'],
      title: i18next.t('myOffers.table.period').toUpperCase(),
      render: (period) => <TableText content={formatSeconds(convertBigNumberToNumber(period))} />,
    },
    {
      dataIndex: 'deposit',
      title: i18next.t('myOffers.step_2.rewardPerIndexer').toUpperCase(),
      render: (deposit) => <TableText content={`${formatEther(deposit)} SQT`} />,
    },
  ];

  return [...idColumns, ...generalColumns];
};

interface MyOfferTableProps {
  queryFn: typeof useOwnOpenOffers | typeof useOwnFinishedOffers | typeof useOwnExpiredOffers | typeof useAllOpenOffers;
  queryParams?: { consumer?: string };
  description?: string;
}

export const OfferTable: React.VFC<MyOfferTableProps> = ({ queryFn, queryParams, description }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { account } = useWeb3();

  const [now, setNow] = React.useState<Date>(moment().toDate());
  const sortedParams = { consumer: queryParams?.consumer ?? '', now };
  const offers = queryFn(sortedParams);
  const [data, setData] = React.useState(offers);
  const totalCount = data?.data?.offers?.totalCount ?? 0;

  //   const sortedCols = pathname === ONGOING_PLANS ? [...columns, playgroundCol] : columns;
  const sortedCols = getColumns();

  // TODO: share same pattern with saTable agreement, think of reusable
  // NOTE: Every 5min to query wit a new timestamp
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().toDate());
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // NOTE: Every 5min to query wit a new timestamp, manual set cache data which is similar to cache-network fetch policy
  React.useEffect(() => {
    if (offers.loading === true && offers.previousData) {
      setData({ ...offers, data: offers.previousData });
      offers.data = offers.previousData;
    } else {
      setData({ ...offers });
    }
  }, [offers, offers.loading]);

  return (
    <>
      {renderAsyncArray(
        mapAsync((d) => d.offers?.nodes.filter(notEmpty), data),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography.Text type="danger">{`Failed to load offers: ${e}`}</Typography.Text>,
          empty: () => <EmptyList i18nKey={'myOffers.non'} />,
          data: (sortedOffer) => {
            return (
              <div>
                {description && totalCount > 0 && <Typography.Text>{description}</Typography.Text>}
                <Table columns={sortedCols} dataSource={sortedOffer} scroll={{ x: 1500 }} rowKey={'id'} />
              </div>
            );
          },
        },
      )}
    </>
  );
};
