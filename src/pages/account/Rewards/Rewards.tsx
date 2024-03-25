// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { TableText } from '@components';
import { TokenAmount } from '@components/TokenAmount';
import { Spinner, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { GetEraRewardsByIndexerAndPageQuery } from '@subql/network-query';
import {
  renderAsync,
  useGetEraRewardsByIndexerAndPageLazyQuery,
  useGetFilteredDelegationsQuery,
  useGetRewardsQuery,
} from '@subql/react-hooks';
import { ExcludeNull, formatEther, notEmpty } from '@utils';
import { retry } from '@utils/retry';
import { useMount, useUpdate } from 'ahooks';
import { Table, TableProps, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';

import { useWeb3Store } from 'src/stores';

import { ClaimRewards } from './ClaimRewards';
import styles from './Rewards.module.css';

export const Rewards: React.FC = () => {
  const { address: account } = useAccount();

  const { contracts } = useWeb3Store();
  const update = useUpdate();
  const filterParams = { address: account || '' };
  const rewards = useGetRewardsQuery({ variables: filterParams, fetchPolicy: 'network-only' });
  const [loading, setLoading] = React.useState(false);

  const queryParams = React.useRef({
    offset: 0,
    pageSize: 10,
    delegatorId: account || '',
    totalCount: 0,
  });
  const [fetchIndexerEraRewardsApi, indexerEraRewards] = useGetEraRewardsByIndexerAndPageLazyQuery();
  const { t } = useTranslation();

  const totalUnclaimedRewards = React.useMemo(() => {
    return rewards.data?.unclaimedRewards?.totalCount || 0;
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

  const columns: TableProps<
    ExcludeNull<ExcludeNull<GetEraRewardsByIndexerAndPageQuery['eraRewards']>['nodes'][number]>
  >['columns'] = [
    {
      title: <TableTitle title={t('rewards.indexer')} />,
      dataIndex: 'indexerId',
      key: 'indexer',
      render: (text: string) => <TableText content={text} />,
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
    const res = await fetchIndexerEraRewardsApi({
      variables: queryParams.current,
      fetchPolicy: 'network-only',
    });
    queryParams.current = {
      ...queryParams.current,
      totalCount: res.data?.eraRewards?.totalCount || 0,
    };
    update();
  };

  // this is a hotfix for unclaimed rewards.
  const [unClaimedRewardsFromContracts, setUnClaimedRewardsFromContracts] = React.useState<{
    indexers: string[];
    amount: BigNumber;
  }>({
    indexers: [],
    amount: BigNumber.from(0),
  });

  const delegations = useGetFilteredDelegationsQuery({
    variables: { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 },
  });
  const indexerIds = React.useMemo(() => {
    return [...(delegations.data?.delegations?.nodes.map((i) => i?.indexerId) || []), account];
  }, [delegations.data?.delegations, unclaimedRewards, account]);

  const getUnclaimedRewards = async () => {
    if (!account || !contracts || !indexerIds?.length) return;

    const inner = async (indexerId: string | undefined) => {
      if (!indexerId) return true;
      const res = await contracts?.rewardsDistributor.userRewards(indexerId, account);
      return [res, indexerId];
    };

    const res = await Promise.allSettled(indexerIds.map((indexer) => inner(indexer)));

    const unClaimedRewardsIndexers = res
      .map((i) => {
        if (i.status === 'fulfilled') {
          const [amount, indexerAddress] = i.value as [BigNumber, string];

          if (!amount.eq(0)) return indexerAddress;
        }

        return undefined;
      })
      .filter((i) => i);

    const unClaimedRewardsAmount = res.reduce((cur, add) => {
      if (add.status === 'fulfilled') {
        const [amount] = add.value as [BigNumber, string];

        return cur.add(amount);
      }
      return cur;
    }, BigNumber.from(0));

    setUnClaimedRewardsFromContracts({
      indexers: unClaimedRewardsIndexers as string[],
      amount: unClaimedRewardsAmount,
    });
  };

  React.useEffect(() => {
    getUnclaimedRewards();
  }, [indexerIds, account, unclaimedRewards]);
  // the above codes is a hotfix

  React.useEffect(() => {
    if (!account) return;
    queryParams.current.offset = 0;
    queryParams.current.delegatorId = account;
    fetchIndexerEraRewards();
  }, [account]);

  useMount(async () => {
    try {
      setLoading(true);
      fetchIndexerEraRewards();
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className={styles.rewardsContainer}>
      <div className={styles.rewardsList}>
        {renderAsync(
          {
            ...indexerEraRewards,
            loading,
          },
          {
            error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
            loading: () => <Spinner />,
            data: (data) => {
              const filterEmptyData = data.eraRewards?.nodes.filter(notEmpty);
              return (
                <>
                  <div className="flex">
                    <InfoCircleOutlined style={{ fontSize: 14, color: '#3AA0FF', marginRight: 8 }} />
                    <Typography type="secondary">{t('rewards.info')}</Typography>
                    <span style={{ flex: 1 }}></span>
                    {(totalUnclaimedRewards > 0 && unclaimedRewards?.indexers) ||
                    unClaimedRewardsFromContracts.indexers.length ? (
                      <ClaimRewards
                        indexers={
                          unClaimedRewardsFromContracts.indexers.length
                            ? unClaimedRewardsFromContracts.indexers
                            : (unclaimedRewards?.indexers as string[])
                        }
                        account={account ?? ''}
                        totalUnclaimed={formatEther(
                          unClaimedRewardsFromContracts.indexers.length
                            ? unClaimedRewardsFromContracts.amount
                            : unclaimedRewards?.totalAmount,
                        )}
                        onClaimed={() => {
                          retry(() => {
                            fetchIndexerEraRewards();
                            rewards.refetch();
                          });
                        }}
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
                </>
              );
            },
          },
        )}
      </div>
    </div>
  );
};

export default Rewards;
