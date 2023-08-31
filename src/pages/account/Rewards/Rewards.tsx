// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, TableText } from '@components';
import { BreadcrumbNav } from '@components';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { Spinner, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { GetEraRewardsByIndexerAndPageQuery } from '@subql/network-query';
import { renderAsync, useGetEraRewardsByIndexerAndPageLazyQuery, useGetRewardsQuery } from '@subql/react-hooks';
import { ExcludeNull, formatEther, notEmpty, ROUTES } from '@utils';
import { useMount, useUpdate } from 'ahooks';
import { Table, TableProps, Tag } from 'antd';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';

import { ClaimRewards } from './ClaimRewards';
import styles from './Rewards.module.css';

export const Rewards: React.FC<{ delegator: string }> = ({ delegator }) => {
  const { account } = useWeb3();

  const update = useUpdate();
  const filterParams = { address: '0x92E4888B6789EB52Da0BebDD82AfE660bf3E8d8f' || delegator };
  const rewards = useGetRewardsQuery({ variables: filterParams, fetchPolicy: 'network-only' });
  const queryParams = React.useRef({
    offset: 0,
    pageSize: 10,
    indexerId: '0x92E4888B6789EB52Da0BebDD82AfE660bf3E8d8f' || account || '',
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
      title: <TableTitle title={t('rewards.delegator')} />,
      dataIndex: 'delegatorId',
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
    // {
    //   title: <TableTitle title="type"></TableTitle>,
    //   dataIndex: 'indexerId',
    //   key: 'indexerId',
    //   render: (indexerId, record) => (
    //     <Typography>{indexerId === record.delegatorId ? 'toIndexer' : 'toDelegator'}</Typography>
    //   ),
    // },
    {
      title: <TableTitle title={t('rewards.action')} />,
      dataIndex: 'action',
      key: 'action',
      render: (_, reward) => {
        const tagColor = reward.claimed ? 'green' : 'blue';
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

  React.useEffect(() => {
    if (!account) return;
    queryParams.current.offset = 0;
    fetchIndexerEraRewards();
  }, [account]);

  useMount(() => {
    fetchIndexerEraRewards();
  });

  return (
    <div className={styles.rewardsContainer}>
      <BreadcrumbNav
        backLink={`${ROUTES.MY_ACCOUNT_NAV}`}
        backLinkText={t('indexer.indexers')}
        childText={t('rewards.claim.title')}
      />
      <AppPageHeader title={t('rewards.claim.title')} desc={t('rewards.description')} />

      <div className={styles.rewardsList}>
        {renderAsync(indexerEraRewards, {
          error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          data: (data) => {
            const filterEmptyData = data.eraRewards?.nodes.filter(notEmpty);
            return (
              <>
                <div className={styles.claim}>
                  <Typography variant="h6" className={styles.header}>
                    {t('rewards.totalUnclaimReward', { count: totalUnclaimedRewards })}
                  </Typography>

                  {totalUnclaimedRewards > 0 && unclaimedRewards?.indexers && (
                    <ClaimRewards
                      indexers={unclaimedRewards?.indexers as string[]}
                      account={account ?? ''}
                      totalUnclaimed={formatEther(unclaimedRewards?.totalAmount)}
                    />
                  )}
                </div>

                <Table
                  columns={columns}
                  dataSource={filterEmptyData || []}
                  scroll={{ x: 600 }}
                  rowKey="id"
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
        })}
      </div>
    </div>
  );
};
