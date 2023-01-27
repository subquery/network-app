// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@subql/react-ui';
import * as React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { BigNumber } from 'ethers';
import { TableProps, Typography } from 'antd';
import { AntDTable, DeploymentMeta, SearchInput, TableText } from '../../../components';
import {
  useAcceptedOffersQuery,
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
  formatSecondsDuration,
  mapAsync,
  mergeAsync,
  notEmpty,
  parseError,
  renderAsyncArray,
} from '../../../utils';
import { GetOwnOpenOffers_offers_nodes as Offer } from '../../../__generated__/registry/GetOwnOpenOffers';
import { useLocation } from 'react-router';
import styles from './OfferTable.module.css';
import { CancelOffer } from './CancelOffer';
import { AcceptOffer } from '../OfferMarketplace/AcceptOffer';
import clsx from 'clsx';
import { TableTitle } from '../../../components/TableTitle';
import { TokenAmount } from '../../../components/TokenAmount';
import { EmptyList } from '../../plans/Plans/EmptyList';
import { ROUTES } from '../../../utils';

const { CONSUMER_OFFER_MARKETPLACE_NAV, CONSUMER_EXPIRED_OFFERS_NAV, CONSUMER_OPEN_OFFERS_NAV } = ROUTES;

const AcceptButton: React.VFC<{ offer: Offer }> = ({ offer }) => {
  const { account } = useWeb3();
  const indexerDeploymentResult = useDeploymentIndexerQuery({
    indexerAddress: account ?? '',
    deploymentId: offer.deployment?.id ?? '',
  });

  const acceptedOffersResult = useAcceptedOffersQuery({ address: account ?? '', offerId: offer.id });

  return (
    <>
      {renderAsyncArray(mergeAsync(indexerDeploymentResult, acceptedOffersResult), {
        loading: () => <Spinner />,
        error: (error) => <Typography.Text className="errorText">{`Error: ${parseError(error)}`}</Typography.Text>,
        empty: () => <></>,
        data: (data) => {
          const [deployment, acceptedOffers] = data;

          const deploymentIndexer = deployment?.deploymentIndexers?.nodes[0];
          const acceptedOffersCount = acceptedOffers?.acceptedOffers?.nodes.length ?? 0;

          // TODO: filter the project that not indexing
          // TODO: confirm whether to filter status ===  TERMINATED
          if (offer.consumer === account) {
            return <TableText content={'Your Offer'} />;
          }

          if (!deploymentIndexer || !account || !acceptedOffers) {
            return <TableText content={'-'} />;
          }

          return (
            <AcceptOffer
              deployment={deploymentIndexer}
              disabled={acceptedOffersCount > 0}
              onAcceptOffer={acceptedOffersResult.refetch}
              offer={offer}
              requiredBlockHeight={convertBigNumberToNumber(offer.minimumAcceptHeight)}
            />
          );
        },
      })}
    </>
  );
};

const getColumns = (
  path: typeof CONSUMER_OPEN_OFFERS_NAV | typeof CONSUMER_OFFER_MARKETPLACE_NAV,
  connectedAccount?: string | null,
) => {
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
      width: 480,
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
      render: (period) => <TableText content={formatSecondsDuration(convertBigNumberToNumber(period))} />,
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
      render: (deposit) => <TokenAmount value={formatEther(deposit)} />,
    },
    {
      dataIndex: 'deposit',
      title: <TableTitle title={i18next.t('myOffers.table.depositAmount')} />,
      render: (deposit, offer) => (
        <TokenAmount value={`${convertStringToNumber(formatEther(deposit)) * offer.limit}`} />
      ),
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
        <TableText
          content={i18next.t('general.blockWithCount', { count: convertBigNumberToNumber(minimumAcceptHeight) })}
        />
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
      render: (_: string, offer: Offer) => {
        return <AcceptButton offer={offer} />;
      },
    },
  ];

  const columnsMapping = {
    [CONSUMER_OPEN_OFFERS_NAV]: [...idColumns, ...generalColumns, ...cancelColumn],
    [CONSUMER_EXPIRED_OFFERS_NAV]: [...idColumns, ...generalColumns, ...withdrawColumn],
    [CONSUMER_OFFER_MARKETPLACE_NAV]: [...idColumns, ...generalColumns, ...acceptColumn],
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
      updateQuery: (previousOffers, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousOffers;
        return { ...fetchMoreResult }; // make it as new object then will trigger render
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
                    {pathname === CONSUMER_OFFER_MARKETPLACE_NAV && (
                      <div className={styles.searchDeployment}>
                        <SearchDeployment />
                      </div>
                    )}
                  </div>

                  <AntDTable
                    customPagination
                    tableProps={{ columns: sortedCols, dataSource: offerList, scroll: { x: 2000 }, rowKey: 'id' }}
                    paginationProps={{
                      total: totalCount,
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
