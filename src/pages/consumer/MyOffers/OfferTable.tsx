// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner } from '@subql/components';
import * as React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { BigNumber } from 'ethers';
import { TableProps, Typography } from 'antd';
import { AntDTable, DeploymentMeta, EmptyList, SearchInput, TableText } from '../../../components';
import { useWeb3 } from '../../../containers';
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
import { useLocation } from 'react-router';
import styles from './OfferTable.module.css';
import { CancelOffer } from './CancelOffer';
import clsx from 'clsx';
import { TableTitle } from '@subql/components';
import { TokenAmount } from '../../../components/TokenAmount';
import { ROUTES } from '../../../utils';
import {
  useGetAcceptedOffersQuery,
  useGetAllOpenOffersQuery,
  useGetOwnExpiredOffersQuery,
  useGetOwnFinishedOffersQuery,
  useGetOwnOpenOffersQuery,
  useGetSpecificOpenOffersQuery,
  useGetDeploymentIndexerQuery,
} from '@subql/react-hooks';
import { OfferFieldsFragment } from '@subql/network-query';
import { AcceptOffer } from '../OfferMarketplace/AcceptOffer';

const { INDEXER_OFFER_MARKETPLACE_NAV, CONSUMER_EXPIRED_OFFERS_NAV, CONSUMER_OPEN_OFFERS_NAV } = ROUTES;

const AcceptButton: React.FC<{ offer: OfferFieldsFragment }> = ({ offer }) => {
  const { account } = useWeb3();
  const indexerDeploymentResult = useGetDeploymentIndexerQuery({
    variables: {
      indexerAddress: account ?? '',
      deploymentId: offer.deployment?.id ?? '',
    },
  });

  const acceptedOffersResult = useGetAcceptedOffersQuery({ variables: { address: account ?? '', offerId: offer.id } });

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
  path: typeof CONSUMER_OPEN_OFFERS_NAV | typeof INDEXER_OFFER_MARKETPLACE_NAV,
  connectedAccount?: string | null,
) => {
  console.log('path', path);

  const idColumns: TableProps<OfferFieldsFragment>['columns'] = [
    {
      dataIndex: 'id',
      title: <TableTitle title={'#'} />,
      width: 60,
      render: (_: string, __: OfferFieldsFragment, idx: number) => <TableText content={idx + 1} />,
    },
    {
      dataIndex: ['deployment', 'id'],
      title: <TableTitle title={i18next.t('myOffers.table.versionDeployment')} />,
      width: 480,
      render: (deploymentId: string, offer: OfferFieldsFragment) => (
        <DeploymentMeta deploymentId={deploymentId} projectMetadata={offer.deployment?.project?.metadata} />
      ),
    },
  ];

  const generalColumns: TableProps<OfferFieldsFragment>['columns'] = [
    {
      title: <TableTitle title={i18next.t('myOffers.table.indexerAmount').toUpperCase()} />,
      children: [
        {
          title: (
            <TableTitle
              title={i18next.t('myOffers.table.accepted')}
              tooltip={i18next.t('myOffers.table.acceptedTooltip')}
            />
          ),
          dataIndex: 'accepted',
          width: 150,
          render: (accepted: number) => <TableText content={accepted} />,
        },
        {
          title: (
            <TableTitle title={i18next.t('myOffers.table.cap')} tooltip={i18next.t('myOffers.table.capTooltip')} />
          ),
          dataIndex: 'limit',
          width: 150,
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

  const cancelColumn: TableProps<OfferFieldsFragment>['columns'] = [
    {
      title: <TableTitle title={i18next.t('general.action').toUpperCase()} />,
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

  const withdrawColumn: TableProps<OfferFieldsFragment>['columns'] = [
    {
      title: <TableTitle title={i18next.t('general.action').toUpperCase()} />,
      dataIndex: 'id',
      fixed: 'right',
      align: 'center',
      width: 100,
      render: (id: string, offer: OfferFieldsFragment) => {
        if (!connectedAccount || offer.withdrawn) return <TableText content="-" />;
        return <CancelOffer offerId={id} />;
      },
    },
  ];

  const acceptColumn: TableProps<OfferFieldsFragment>['columns'] = [
    {
      title: <TableTitle title={i18next.t('offerMarket.accept').toUpperCase()} />,
      dataIndex: 'id',
      fixed: 'right',
      align: 'center',
      render: (_: string, offer: OfferFieldsFragment) => {
        return <AcceptButton offer={offer} />;
      },
    },
  ];

  const columnsMapping = {
    [CONSUMER_OPEN_OFFERS_NAV]: [...idColumns, ...generalColumns, ...cancelColumn],
    [CONSUMER_EXPIRED_OFFERS_NAV]: [...idColumns, ...generalColumns, ...withdrawColumn],
    [INDEXER_OFFER_MARKETPLACE_NAV]: [...idColumns, ...generalColumns, ...acceptColumn],
  };

  return columnsMapping[path] ?? [...idColumns, ...generalColumns];
};

interface MyOfferTableProps {
  queryFn:
    | typeof useGetOwnOpenOffersQuery
    | typeof useGetOwnFinishedOffersQuery
    | typeof useGetOwnExpiredOffersQuery
    | typeof useGetAllOpenOffersQuery;
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
  const sortedParams = (offset: number) => ({
    consumer: queryParams?.consumer ?? '',
    now,
    deploymentId: searchDeploymentId ?? '',
    offset,
  });
  const sortedFn = searchDeploymentId ? useGetSpecificOpenOffersQuery : queryFn;
  const sortedOffers = sortedFn({ variables: sortedParams(0) });

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

  // NOTE: Every 1min to query wit a new timestamp
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().toDate());
    }, 60000);
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
          empty: () => <EmptyList description={'myOffers.non'} />,
          data: (offerList) => {
            return (
              <div>
                {description && totalCount > 0 && (
                  <Typography.Text className={styles.description}>{description}</Typography.Text>
                )}
                <div>
                  <div className={clsx('flex-between', styles.offerTableHeader)}>
                    <Typography.Title level={3}>{t('offerMarket.totalOffer', { count: totalCount })}</Typography.Title>
                    {pathname === INDEXER_OFFER_MARKETPLACE_NAV && (
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
