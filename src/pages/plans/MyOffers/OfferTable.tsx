// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@subql/react-ui';
import * as React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { BigNumber } from 'ethers';
import { Table, TableProps, Typography } from 'antd';
import { DeploymentMeta, SearchInput, TableText } from '../../../components';
import {
  useAllOpenOffers,
  useDeploymentIndexerQuery,
  useOwnExpiredOffers,
  useOwnFinishedOffers,
  useOwnOpenOffers,
  useSpecificOpenOffers,
  useWeb3,
} from '../../../containers';
import {
  convertBigNumberToNumber,
  convertStringToNumber,
  formatDate,
  formatEther,
  formatSeconds,
  mapAsync,
  notEmpty,
  parseError,
  renderAsync,
  renderAsyncArray,
} from '../../../utils';
import { GetOwnOpenOffers_offers_nodes as Offer } from '../../../__generated__/registry/GetOwnOpenOffers';
import { EmptyList } from '../Plans/EmptyList';
import { useLocation } from 'react-router';
import styles from './OfferTable.module.css';
import { EXPIRED_OFFERS, OPEN_OFFERS } from './MyOffers';
import { OFFER_MARKETPLACE } from '..';
import { CancelOffer } from './CancelOffer';
import { AcceptOffer } from '../OfferMarketplace/AcceptOffer';
import clsx from 'clsx';
import { TableTitle } from '../../../components/TableTitle';

const AcceptButton: React.VFC<{ offer: Offer }> = ({ offer }) => {
  const { account } = useWeb3();
  const indexerDeployment = useDeploymentIndexerQuery({
    indexerAddress: account ?? '',
    deploymentId: offer.deployment?.id ?? '',
  });

  return (
    <>
      {renderAsync(indexerDeployment, {
        loading: () => <Spinner />,
        error: (error) => <Typography.Text className="errorText">{`Error: ${parseError(error)}`}</Typography.Text>,
        data: (deployment) => {
          const deploymentIndexer = deployment.deploymentIndexers?.nodes[0];
          // TODO: filter the project that not indexing
          // TODO: confirm whether to filter status ===  TERMINATED
          if (offer.consumer === account) {
            return <TableText content={'Your Offer'} />;
          }

          if (!deploymentIndexer || !account) {
            return <TableText content={'-'} />;
          }

          return (
            <AcceptOffer
              deployment={deploymentIndexer}
              offerId={offer.id}
              requiredBlockHeight={convertBigNumberToNumber(offer.minimumAcceptHeight)}
            />
          );
        },
      })}
    </>
  );
};

// TODO: Add tooltip
const getColumns = (path: typeof OPEN_OFFERS | typeof OFFER_MARKETPLACE, connectedAccount?: string | null) => {
  const idColumns: TableProps<Offer>['columns'] = [
    {
      dataIndex: 'id',
      title: '#',
      width: 60,
      render: (_: string, __: Offer, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: ['deployment', 'id'],
      title: <TableTitle title={i18next.t('myOffers.table.versionDeployment')} />,
      width: 460,
      render: (deploymentId: string, offer: Offer) => (
        <DeploymentMeta deploymentId={deploymentId} projectMetadata={offer.deployment?.project?.metadata} />
      ),
    },
  ];

  const generalColumns: TableProps<Offer>['columns'] = [
    {
      title: i18next.t('myOffers.table.indexerAmount').toUpperCase(),
      children: [
        {
          title: (
            <TableTitle
              title={i18next.t('myOffers.table.accepted')}
              tooltip={i18next.t('myOffers.table.acceptedTooltip')}
            />
          ),
          dataIndex: 'accepted',
          width: 100,
          render: (accepted: number) => <TableText content={accepted} />,
        },
        {
          title: (
            <TableTitle title={i18next.t('myOffers.table.cap')} tooltip={i18next.t('myOffers.table.capTooltip')} />
          ),
          dataIndex: 'limit',
          width: 100,
          render: (limit: number) => <TableText content={limit} />,
        },
      ],
    },
    {
      dataIndex: ['planTemplate', 'period'],
      title: (
        <TableTitle title={i18next.t('myOffers.table.period')} tooltip={i18next.t('myOffers.table.periodTooltip')} />
      ),
      render: (period) => <TableText content={formatSeconds(convertBigNumberToNumber(period))} />,
    },
    {
      dataIndex: 'deposit',
      title: (
        <TableTitle
          title={i18next.t('myOffers.table.totalRewardsPerIndexer')}
          tooltip={i18next.t('myOffers.table.totalRewardsPerIndexerTooltip')}
        />
      ),
      width: 200,
      render: (deposit, offer) => (
        <TableText content={`${convertStringToNumber(formatEther(deposit)) / offer.limit} SQT`} />
      ),
    },
    {
      dataIndex: 'deposit',
      title: <TableTitle title={i18next.t('myOffers.table.depositAmount')} />,
      render: (deposit) => <TableText content={`${formatEther(deposit)} SQT`} />,
    },
    {
      dataIndex: 'minimumAcceptHeight',
      title: (
        <TableTitle
          title={i18next.t('myOffers.table.minIndexedHeight')}
          tooltip={i18next.t('myOffers.table.minIndexedHeightTooltip')}
        />
      ),
      width: 180,
      render: (minimumAcceptHeight) => (
        <TableText content={i18next.t('general.block', { count: convertBigNumberToNumber(minimumAcceptHeight) })} />
      ),
    },
    {
      dataIndex: ['planTemplate', 'dailyReqCap'],
      title: <TableTitle title={i18next.t('plans.headers.dailyReqCap')} />,
      width: 160,
      render: (dailyReqCap: BigNumber) => (
        <TableText content={i18next.t('plans.default.query', { count: convertBigNumberToNumber(dailyReqCap) })} />
      ),
    },
    {
      dataIndex: ['planTemplate', 'rateLimit'],
      title: <TableTitle title={i18next.t('plans.headers.rateLimit')} />,
      width: 160,
      render: (rateLimit: BigNumber) => (
        <TableText content={`${convertBigNumberToNumber(rateLimit)} ${i18next.t('plans.default.requestPerMin')}`} />
      ),
    },
    {
      dataIndex: 'expireDate',
      title: <TableTitle title={i18next.t('myOffers.table.expired')} />,
      render: (expireDate: Date) => (
        <TableText content={moment(expireDate).utc(true).fromNow()} tooltip={formatDate(expireDate)} />
      ),
    },
  ];

  const cancelColumn: TableProps<Offer>['columns'] = [
    {
      title: i18next.t('general.action').toUpperCase(),
      dataIndex: 'id',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (id: string) => {
        if (!connectedAccount) return <TableText content="-" />;
        return <CancelOffer offerId={id} />;
      },
    },
  ];

  const withdrawColumn: TableProps<Offer>['columns'] = [
    {
      title: i18next.t('general.action').toUpperCase(),
      dataIndex: 'id',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (id: string, offer: Offer) => {
        if (!connectedAccount || offer.withdrawn) return <TableText content="-" />;
        return <CancelOffer offerId={id} />;
      },
    },
  ];

  const acceptColumn: TableProps<Offer>['columns'] = [
    {
      title: i18next.t('offerMarket.accept').toUpperCase(),
      dataIndex: 'id',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (_: string, offer: Offer) => {
        return <AcceptButton offer={offer} />;
      },
    },
  ];

  const columnsMapping = {
    [OPEN_OFFERS]: [...idColumns, ...generalColumns, ...cancelColumn],
    [EXPIRED_OFFERS]: [...idColumns, ...generalColumns, ...withdrawColumn],
    [OFFER_MARKETPLACE]: [...idColumns, ...generalColumns, ...acceptColumn],
  };

  return columnsMapping[path] ?? [...idColumns, ...generalColumns];
};

interface MyOfferTableProps {
  queryFn: typeof useOwnOpenOffers | typeof useOwnFinishedOffers | typeof useOwnExpiredOffers | typeof useAllOpenOffers;
  queryParams?: { consumer?: string };
  description?: string;
}

// TODO: update totalCount text via design
export const OfferTable: React.VFC<MyOfferTableProps> = ({ queryFn, queryParams, description }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { account } = useWeb3();
  const sortedCols = getColumns(pathname, account);

  /**
   * SearchInput logic
   */
  const [searchDeploymentId, setSearchDeploymentId] = React.useState<string | undefined>();
  const [now, setNow] = React.useState<Date>(moment().toDate());
  const sortedParams = { consumer: queryParams?.consumer ?? '', now, deploymentId: searchDeploymentId ?? '' };
  const sortedFn = searchDeploymentId ? useSpecificOpenOffers : queryFn;
  const sortedOffers = sortedFn(sortedParams);

  const SearchDeployment = () => (
    <div className={styles.indexerSearch}>
      <SearchInput
        onSearch={(value: string) => {
          setSearchDeploymentId(value);
        }}
        defaultValue={searchDeploymentId}
        loading={sortedOffers.loading}
        emptyResult={sortedOffers.data?.offers?.totalCount === 0}
        placeholder={t('offerMarket.searchByDeploymentId')}
      />
    </div>
  );

  /**
   * SearchInput logic end
   */

  const [data, setData] = React.useState(sortedOffers);
  const totalCount = data?.data?.offers?.totalCount ?? 0;

  const fetchMoreOffers = (offset: number) => {
    sortedOffers.fetchMore({
      variables: {
        offset,
        ...sortedParams,
      },
    });
  };

  // TODO: share same pattern with saTable agreement, think of reusable
  // NOTE: Every 5min to query wit a new timestamp
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().toDate());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // NOTE: Every 5min to query wit a new timestamp, manual set cache data which is similar to cache-network fetch policy
  React.useEffect(() => {
    if (sortedOffers.loading === true && sortedOffers.previousData) {
      setData({ ...sortedOffers, data: sortedOffers.previousData });
      sortedOffers.data = sortedOffers.previousData;
    } else {
      setData({ ...sortedOffers });
    }
  }, [sortedOffers, sortedOffers.loading]);

  return (
    <>
      {renderAsyncArray(
        mapAsync((d) => d.offers?.nodes.filter(notEmpty), data),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography.Text type="danger">{`Failed to load offers: ${e}`}</Typography.Text>,
          empty: () => <EmptyList i18nKey={'myOffers.non'} />,
          data: (offerList) => {
            return (
              <div>
                {description && totalCount > 0 && (
                  <Typography.Text className={styles.description}>{description}</Typography.Text>
                )}
                <div>
                  <div className={clsx('flex-between', styles.offerTableHeader)}>
                    <Typography.Title level={3}>{t('offerMarket.totalOffer', { count: totalCount })}</Typography.Title>
                    {pathname === OFFER_MARKETPLACE && (
                      <div className={styles.searchDeployment}>
                        <SearchDeployment />
                      </div>
                    )}
                  </div>
                  <Table
                    columns={sortedCols}
                    dataSource={offerList}
                    scroll={{ x: 1800 }}
                    rowKey={'id'}
                    pagination={{
                      total: totalCount,
                      pageSizeOptions: ['10', '20'],
                      onShowSizeChange: (current, pageSize) => {
                        fetchMoreOffers?.((current - 1) * pageSize);
                      },
                      onChange: (page, pageSize) => {
                        fetchMoreOffers?.((page - 1) * pageSize);
                      },
                    }}
                  />
                </div>
              </div>
            );
          },
        },
      )}
    </>
  );
};
