// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { Spinner, TableTitle } from '@subql/components';
import { OfferFieldsFragment } from '@subql/network-query';
import {
  useGetAcceptedOffersQuery,
  useGetAllOpenOffersLazyQuery,
  useGetIndexerDeploymentQuery,
  useGetOwnExpiredOffersLazyQuery,
  useGetOwnFinishedOffersLazyQuery,
  useGetOwnOpenOffersLazyQuery,
  useGetSpecificOpenOffersLazyQuery,
} from '@subql/react-hooks';
import { EVENT_TYPE, EventBus } from '@utils/eventBus';
import { TableProps, Typography } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { BigNumber, ContractReceipt } from 'ethers';
import i18next from 'i18next';

import { AntDTable, DeploymentMeta, EmptyList, SearchInput, TableText } from '../../../components';
import { TokenAmount } from '../../../components/TokenAmount';
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
  ROUTES,
  URLS,
} from '../../../utils';
import { AcceptOffer } from '../OfferMarketplace/AcceptOffer';
import { CancelOffer } from './CancelOffer';
import styles from './OfferTable.module.css';

const { INDEXER_OFFER_MARKETPLACE_NAV, CONSUMER_EXPIRED_OFFERS_NAV, CONSUMER_OPEN_OFFERS_NAV } = ROUTES;

const AcceptButton: React.FC<{ offer: OfferFieldsFragment }> = ({ offer }) => {
  const { account } = useWeb3();
  const waitTransactionHandled = useWaitTransactionhandled();
  const indexerDeploymentResult = useGetIndexerDeploymentQuery({
    variables: {
      indexerAddress: account ?? '',
      deploymentId: offer.deployment?.id ?? '',
    },
  });

  const acceptedOffersResult = useGetAcceptedOffersQuery({
    variables: { address: account ?? '', offerId: offer.id },
    fetchPolicy: 'network-only',
  });

  return (
    <>
      {renderAsyncArray(mergeAsync(indexerDeploymentResult, acceptedOffersResult), {
        loading: () => <Spinner />,
        error: (error) => <Typography.Text className="errorText">{`Error: ${parseError(error)}`}</Typography.Text>,
        empty: () => <></>,
        data: (data) => {
          const [deployment, acceptedOffers] = data;

          const deploymentIndexer = deployment?.indexerDeployments?.nodes[0];
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
              onAcceptOffer={async (_, receipt) => {
                await waitTransactionHandled(receipt?.blockNumber);
                await acceptedOffersResult.refetch();
              }}
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
  onCancelSuccess?: (_: unknown, receipt?: ContractReceipt) => void,
) => {
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
        <TableText content={dayjs(expireDate).utc(true).fromNow()} tooltip={formatDate(expireDate)} />
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
      render: (id: string, record) => {
        if (!connectedAccount) return <TableText content="-" />;

        return <CancelOffer offerId={id} onSuccess={onCancelSuccess} active={record.planTemplate?.active} />;
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
    | typeof useGetOwnOpenOffersLazyQuery
    | typeof useGetOwnFinishedOffersLazyQuery
    | typeof useGetOwnExpiredOffersLazyQuery
    | typeof useGetAllOpenOffersLazyQuery;
  queryParams?: { consumer?: string; expireDate?: Date };
  description?: string;
}

// TODO: update totalCount text via design
export const OfferTable: React.FC<MyOfferTableProps> = ({ queryFn, queryParams, description }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { account } = useWeb3();
  const waitTransactionHandled = useWaitTransactionhandled();

  /**
   * SearchInput logic
   */
  const [searchDeploymentId, setSearchDeploymentId] = React.useState<string | undefined>();
  const [now, setNow] = React.useState<Date>(dayjs().toDate());
  const [curPage, setCurPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const sortedParams = (offset: number) => ({
    consumer: queryParams?.consumer ?? '',
    now: queryParams?.expireDate ?? now,
    deploymentId: searchDeploymentId ?? '',
    offset,
  });
  const sortedFn = searchDeploymentId ? useGetSpecificOpenOffersLazyQuery : queryFn;
  const [loadSortedOffers, sortedOffers] = sortedFn();

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
  const totalCount = React.useMemo(() => {
    return data?.data?.offers?.totalCount ?? 0;
  }, [data]);

  const fetchMoreOffers = async (offset?: number) => {
    const res = await loadSortedOffers({
      variables: sortedParams(offset ?? (curPage - 1) * pageSize),
      fetchPolicy: 'network-only',
    });

    if (res.data?.offers) {
      setData(res);
    }
  };

  const refreshAfterCancel = () => {
    if (data.data?.offers?.nodes.length === 1 && curPage > 1) {
      setCurPage(curPage - 1);
      fetchMoreOffers((curPage - 2) * pageSize);
    } else {
      fetchMoreOffers();
    }
  };

  // NOTE: Every 1min to query wit a new timestamp
  React.useEffect(() => {
    fetchMoreOffers(0);

    const interval = setInterval(() => {
      setNow(dayjs().toDate());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const refresh = () => {
      fetchMoreOffers();
    };
    EventBus.on(EVENT_TYPE.CREATED_CONSUMER_OFFER, refresh);

    return () => {
      EventBus.off(EVENT_TYPE.CREATED_CONSUMER_OFFER, refresh);
    };
  }, [fetchMoreOffers, curPage, pageSize]);

  return (
    <>
      {renderAsyncArray(
        mapAsync((d) => d.offers?.nodes.filter(notEmpty), data),
        {
          loading: () => <Spinner />,
          error: (e) => (
            <>
              <Typography.Text type="danger">Error: </Typography.Text>{' '}
              <Typography.Text type="secondary">{`Failed to load offers: ${e}`}</Typography.Text>
            </>
          ),
          empty: () => (
            <EmptyList
              title={t('myOffers.noOffersTitle')}
              description={[t('myOffers.noOffersDesc_1'), t('myOffers.noOffersDesc_2')]}
              infoI18nKey={'myOffers.noOffersInfoLink'}
              infoLinkDesc={t('myOffers.noOffersInfoLink')}
              infoLink={URLS.PLANS_OFFERS}
            />
          ),
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
                    tableProps={{
                      columns: getColumns(
                        pathname as typeof CONSUMER_OPEN_OFFERS_NAV | typeof INDEXER_OFFER_MARKETPLACE_NAV,
                        account,
                        async (_, receipt) => {
                          await waitTransactionHandled(receipt?.blockNumber);
                          await refreshAfterCancel();
                        },
                      ),
                      dataSource: offerList,
                      scroll: { x: 2000 },
                      rowKey: 'id',
                    }}
                    paginationProps={{
                      total: totalCount,
                      pageSize,
                      current: curPage,
                      onChange: (page, pageSize) => {
                        fetchMoreOffers?.((page - 1) * pageSize);
                        setCurPage(page);
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
