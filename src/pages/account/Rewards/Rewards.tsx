// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { gql, useLazyQuery } from '@apollo/client';
import { IndexerName } from '@components/IndexerDetails/IndexerName';
import { useMakeNotification } from '@components/NotificationCentre/useMakeNotification';
import { TokenAmount } from '@components/TokenAmount';
import { useAccount } from '@containers/Web3';
import { useEra } from '@hooks';
import { useIsMobile } from '@hooks/useIsMobile';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { Spinner, TableText, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { GetEraRewardsByIndexerAndPageQuery } from '@subql/network-query';
import {
  renderAsync,
  useAsyncMemo,
  useGetEraRewardsByIndexerAndPageLazyQuery,
  useGetRewardsQuery,
} from '@subql/react-hooks';
import { ExcludeNull, formatEther, notEmpty } from '@utils';
import { useMount, useUpdate } from 'ahooks';
import { Table, TableProps, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';

import { ClaimRewards, ClaimRewardsForStake } from './ClaimRewards';
import styles from './Rewards.module.css';

export const Rewards: React.FC = () => {
  const { address: account } = useAccount();
  const update = useUpdate();
  const navigate = useNavigate();
  const filterParams = { address: account || '' };
  const { currentEra } = useEra();
  const isMobile = useIsMobile();
  // if more than 100 delegations, need claim twice.
  const rewards = useGetRewardsQuery({ variables: filterParams, fetchPolicy: 'network-only' });
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const queryParams = React.useRef({
    offset: 0,
    pageSize: 10,
    delegatorId: account || '',
    totalCount: 0,
  });
  const [fetchIndexerEraRewardsApi, indexerEraRewards] = useGetEraRewardsByIndexerAndPageLazyQuery();
  const [fetchUnhealthyRewards] = useLazyQuery<{
    indexers: {
      nodes: { active: boolean; lastClaimEra: string; id: string }[];
    };
  }>(gql`
    query GetUnhealthyRewards($indexerAddress: [String!]!) {
      indexers(filter: { id: { in: $indexerAddress } }) {
        nodes {
          active
          lastClaimEra
          id
        }
      }
    }
  `);
  const waitTransactionHandled = useWaitTransactionhandled();
  const { refreshAndMakeUnClaimedNotification } = useMakeNotification();
  const { t } = useTranslation();

  const totalUnclaimedRewards = React.useMemo(() => {
    return indexerEraRewards.data?.unclaimedEraRewards?.totalCount || 0;
  }, [indexerEraRewards]);

  const unclaimedRewardsCountByIndexer = React.useMemo(() => {
    return rewards?.data?.unclaimedRewards?.totalCount || 0;
  }, [rewards]);

  const unclaimedRewards = React.useMemo(() => {
    return rewards?.data?.unclaimedRewards?.nodes?.reduce(
      (result, unclaimedReward) => {
        const totalUnclaimed = result.totalAmount.add(BigNumber.from(unclaimedReward?.amount ?? '0'));
        const sortedIndexers = [...result.indexers, unclaimedReward?.indexerAddress];
        return { indexers: sortedIndexers, totalAmount: totalUnclaimed };
      },
      {
        indexers: [] as Array<string | undefined>,
        totalAmount: BigNumber.from('0'),
      },
    );
  }, [rewards]);

  const unhealthyIndexers = useAsyncMemo(async () => {
    const unhealthyIndexers = await fetchUnhealthyRewards({
      variables: {
        currentEra: `${currentEra.data?.index}`,
        indexerAddress: unclaimedRewards?.indexers,
      },
    });

    const unregisteredIndexers = unhealthyIndexers.data?.indexers.nodes.filter((item) => !item.active) || [];
    const unclaimedIndexers =
      unhealthyIndexers.data?.indexers.nodes.filter(
        (item) => item.lastClaimEra !== `${(currentEra.data?.index || 1) - 1}`,
      ) || [];
    return { unregisteredIndexers, unclaimedIndexers };
  }, [unclaimedRewards, currentEra.data?.index]);

  const canClaimForStakeIndexers = React.useMemo(() => {
    if (unhealthyIndexers.loading) return [];

    const canClaimIndexers = unclaimedRewards?.indexers.filter((item) => {
      return (
        !unhealthyIndexers.data?.unclaimedIndexers.some((unclaimedItem) => unclaimedItem.id === item) &&
        !unhealthyIndexers.data?.unregisteredIndexers.some((unclaimedItem) => unclaimedItem.id === item)
      );
    });

    return canClaimIndexers;
  }, [unhealthyIndexers.data, unhealthyIndexers.loading, unclaimedRewards?.indexers]);

  const columns: TableProps<
    ExcludeNull<ExcludeNull<GetEraRewardsByIndexerAndPageQuery['eraRewards']>['nodes'][number]>
  >['columns'] = [
    {
      title: <TableTitle title={t('rewards.indexer')} />,
      dataIndex: 'indexerId',
      key: 'indexer',
      render: (text: string) => (
        <IndexerName
          address={text}
          onClick={() => {
            navigate(`/indexer/${text}`);
          }}
        ></IndexerName>
      ),
    },
    {
      title: <TableTitle title={t('rewards.amount')} />,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: bigint) => <TokenAmount value={formatEther(amount)} />,
    },
    {
      title: <TableTitle title={t('rewards.era')} />,
      dataIndex: 'eraId',
      key: 'eraId',
      render: (eraId: string) => <Typography>{parseInt(eraId, 16)}</Typography>,
    },
    {
      title: <TableTitle title={t('rewards.time')} />,
      dataIndex: 'createdTimestamp',
      key: 'createdTimestamp',
      render: (createdTimestamp: Date) => <Typography>{dayjs(createdTimestamp).format('YYYY-MM-DD HH:mm')}</Typography>,
    },
    {
      title: <TableTitle title={t('rewards.status')} />,
      dataIndex: 'action',
      key: 'action',
      render: (_, reward) => {
        const tagColor = reward.claimed ? 'green' : 'blue';
        if (reward.isCommission) {
          return (
            <Tooltip title="Please go withdrawals page to check this reward">
              <Tag color={tagColor}>{t('withdrawals.commission')}</Tag>
            </Tooltip>
          );
        }
        return <Tag color={tagColor}>{reward.claimed ? t('rewards.claimed') : t('rewards.unclaimed')}</Tag>;
      },
    },
  ];

  const fetchIndexerEraRewards = async () => {
    try {
      setLoading(true);
      const res = await fetchIndexerEraRewardsApi({
        variables: queryParams.current,
        fetchPolicy: 'network-only',
      });
      queryParams.current = {
        ...queryParams.current,
        totalCount: res.data?.eraRewards?.totalCount || 0,
      };
      update();
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!account) return;
    queryParams.current.offset = 0;
    queryParams.current.delegatorId = account;
    fetchIndexerEraRewards();
  }, [account]);

  useMount(async () => {
    try {
      await fetchIndexerEraRewards();
    } finally {
      setMounted(true);
    }
  });
  console.warn(canClaimForStakeIndexers);
  return (
    <div className={styles.rewardsContainer}>
      <div className={styles.rewardsList}>
        {renderAsync(
          {
            ...indexerEraRewards,
            loading: !mounted ? loading : false,
            data: indexerEraRewards.data || indexerEraRewards.previousData,
          },
          {
            error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,

            loading: () => (
              <div style={{ height: 777, flexShrink: 0 }}>
                <Spinner />
              </div>
            ),
            data: (data) => {
              const filterEmptyData = data.eraRewards?.nodes.filter(notEmpty);

              return (
                <div
                  className="col-flex"
                  style={{
                    minHeight: 777,
                    gap: 8,
                  }}
                >
                  <div className={isMobile ? 'col-flex' : 'flex'} style={{ gap: 24 }}>
                    <div className="flex" style={{ alignItems: 'flex-start' }}>
                      <InfoCircleOutlined style={{ fontSize: 14, color: '#3AA0FF', marginRight: 8, marginTop: 10 }} />
                      <Typography type="secondary" style={{ lineHeight: '36px' }}>
                        {t('rewards.info')}
                      </Typography>
                    </div>
                    <span style={{ flex: 1 }}></span>
                    {totalUnclaimedRewards > 0 && canClaimForStakeIndexers?.length ? (
                      <ClaimRewardsForStake
                        indexers={canClaimForStakeIndexers as string[]}
                        unhealthyIndexers={unhealthyIndexers.data}
                        account={account ?? ''}
                        totalUnclaimed={formatEther(unclaimedRewards?.totalAmount)}
                        onClaimed={async (tx) => {
                          await waitTransactionHandled(tx?.blockNumber);

                          fetchIndexerEraRewards();
                          rewards.refetch();
                          refreshAndMakeUnClaimedNotification();
                        }}
                        unCliamedCountByIndexer={unclaimedRewardsCountByIndexer}
                      />
                    ) : (
                      ''
                    )}

                    {totalUnclaimedRewards > 0 && unclaimedRewards?.indexers ? (
                      <ClaimRewards
                        indexers={unclaimedRewards?.indexers as string[]}
                        account={account ?? ''}
                        totalUnclaimed={formatEther(unclaimedRewards?.totalAmount)}
                        onClaimed={async (tx) => {
                          await waitTransactionHandled(tx?.blockNumber);

                          fetchIndexerEraRewards();
                          rewards.refetch();
                          refreshAndMakeUnClaimedNotification();
                        }}
                        unCliamedCountByIndexer={unclaimedRewardsCountByIndexer}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                  <div className={styles.claim}>
                    <Typography className={styles.header}>
                      {t('rewards.totalUnclaimReward', { count: totalUnclaimedRewards })}
                    </Typography>
                  </div>

                  <Table
                    columns={columns}
                    dataSource={filterEmptyData || []}
                    scroll={{ x: 600 }}
                    rowKey={(record, index) => `${record.eraId}${record.delegatorId}${record.indexerId}${index}`}
                    loading={indexerEraRewards.loading}
                    pagination={{
                      current: Math.floor(queryParams.current.offset / queryParams.current.pageSize) + 1,
                      pageSize: queryParams.current.pageSize,
                      total: queryParams.current.totalCount,
                      onChange(page, pageSize) {
                        const offset = pageSize !== queryParams.current.pageSize ? 0 : (page - 1) * pageSize;
                        queryParams.current = {
                          ...queryParams.current,
                          pageSize: pageSize,
                          offset,
                        };
                        fetchIndexerEraRewards();
                      },
                    }}
                  />
                </div>
              );
            },
          },
        )}
      </div>
    </div>
  );
};

export default Rewards;
