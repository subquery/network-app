// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { gql, useLazyQuery } from '@apollo/client';
import { AppPageHeader } from '@components/AppPageHeader';
import { APYTooltip } from '@components/APYTooltip';
import { Button } from '@components/Button';
import { EmptyList } from '@components/EmptyList';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { OutlineDot } from '@components/Icons/Icons';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import RpcError from '@components/RpcError';
import { TokenAmount } from '@components/TokenAmount';
import { WalletRoute } from '@components/WalletRoute';
import { useWeb3 } from '@containers';
import { useEra, useLockPeriod } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '@hooks/useEraValue';
import { useMinCommissionRate } from '@hooks/useMinCommissionRate';
import { FormatCardLine } from '@pages/account';
import { BalanceLayout } from '@pages/dashboard';
import { RewardsLineChart } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { ChatBoxPlanTextTrigger, Spinner, SubqlCard, TableText, TableTitle, Typography } from '@subql/components';
import {
  truncFormatEtherStr,
  useAsyncMemo,
  useGetDelegatorApiesQuery,
  useGetDelegatorTotalAndLastEraDistictiveRewardsByIndexerQuery,
  useGetDelegatorTotalRewardsQuery,
  useGetFilteredDelegationsQuery,
  useGetSpecifyDelegatorsIndexerApyQuery,
  useGetTotalDelegationWithdrawlsQuery,
  useGetTotalRewardsAndUnclaimRewardsQuery,
} from '@subql/react-hooks';
import { formatEther, isRPCError, mapAsync, mergeAsync, notEmpty, renderAsync, ROUTES, TOKEN } from '@utils';
import { formatNumber } from '@utils';
import { limitContract, makeCacheKey } from '@utils/limitation';
import { useSize } from 'ahooks';
import { Dropdown, Table, TableProps, Tag, Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';
import { BigNumberish } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { t, TFunction } from 'i18next';

import { PER_MILL } from 'src/const/const';
import { useChatBoxStore } from 'src/stores/chatbox';

import { formatNumberWithLocale, formatSQT } from '../../utils/numberFormatters';
import { DoDelegate } from './DoDelegate';
import { DoUndelegate } from './DoUndelegate';
import styles from './MyDelegation.module.css';

const useGetColumn = ({ onSuccess }: { onSuccess?: () => void }) => {
  const navigate = useNavigate();
  const { currentEra } = useEra();
  const lock = useLockPeriod();

  const hours = React.useMemo(() => {
    return dayjs
      .duration(+(lock.data || 0), 'seconds')
      .as('hours')
      .toPrecision(3);
  }, [lock]);

  const getColumns = (
    t: TFunction,
  ): TableProps<{
    value: CurrentEraValue<string>;
    indexer: string;
    lastEraRewards: string;
    indexerActive?: boolean;
    capacity: CurrentEraValue<BigNumberish>;
    lastDelegationEra: number;
  }>['columns'] => [
    {
      title: <TableTitle title={'#'} />,
      key: 'idx',
      width: 50,
      render: (_: string, __: unknown, index: number) => <TableText content={index + 1} />,
    },
    {
      title: <TableTitle title={t('indexer.nickname')} />,
      dataIndex: 'indexer',
      width: 250,
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
      title: (
        <Typography
          weight={600}
          variant="small"
          type="secondary"
          className="flex-center"
          style={{ textTransform: 'uppercase' }}
        >
          Estimated APY
          <APYTooltip
            currentEra={undefined}
            calculationDescription={
              'This is your estimated APY for this delegation to this Node Operator over the previous three Eras'
            }
          />
        </Typography>
      ),
      width: 200,
      dataIndex: 'apy',
      render: (apy: string, record) => {
        // if era 1 did delegate, at least wait era 3 will receive rewards
        if (apy === '0' && (currentEra.data?.index || 0) < (record.lastDelegationEra || 0) + 2)
          return (
            <Tooltip title={t('rewards.receiveRewardsInfo')}>
              <Typography>-</Typography>
              <InfoCircleOutlined style={{ marginLeft: 4, color: 'var(--sq-gray500)' }} />
            </Tooltip>
          );
        return <Typography>{BigNumberJs(formatEther(apy)).multipliedBy(100).toFixed(2)} %</Typography>;
      },
    },
    {
      title: <TableTitle title={t('indexer.commission')} />,
      key: 'commissionKey',
      dataIndex: 'commission',
      width: 50,
      render: (value: { current: string; after: string }) => {
        return (
          <div className="col-flex">
            <Typography>{value.current}%</Typography>
            <EstimatedNextEraLayout value={`${value.after.toString()}%`}></EstimatedNextEraLayout>
          </div>
        );
      },
    },
    {
      title: <TableTitle title="Remaining capacity" />,
      key: 'capacityKey',
      dataIndex: 'capacity',
      width: 200,
      render: (value: { current: string; after: string }) => {
        return (
          <div className="col-flex">
            <Typography>
              <TokenAmount
                tooltip={`${formatNumberWithLocale(
                  BigNumberJs(formatEther(value.current, 4)).isLessThan(0) ? 0 : formatEther(value.current, 4),
                )} ${TOKEN}`}
                value={formatNumber(
                  BigNumberJs(formatEther(value.current, 4)).isLessThan(0) ? 0 : formatEther(value.current, 4),
                )}
              />
            </Typography>
            <EstimatedNextEraLayout
              valueTooltip={`${formatNumberWithLocale(
                BigNumberJs(formatEther(value.after, 4)).isLessThan(0) ? 0 : formatEther(value.after, 4),
              )} ${TOKEN}`}
              value={`${formatNumber(
                BigNumberJs(formatEther(value.after, 4)).isLessThan(0) ? 0 : formatEther(value.after, 4),
              )} ${TOKEN}`}
            ></EstimatedNextEraLayout>
          </div>
        );
      },
    },
    {
      title: <TableTitle title={'Delegation amount'} />,
      width: 200,
      dataIndex: 'value',
      render: (val) => {
        return (
          <div className="flex" style={{ gap: 10 }}>
            <div className="col-flex">
              <Typography>
                {
                  <TokenAmount
                    tooltip={`${formatNumberWithLocale(val?.current || '0')} ${TOKEN}`}
                    value={formatNumber(val?.current || '0')}
                  />
                }
              </Typography>
              <EstimatedNextEraLayout
                valueTooltip={`${formatNumberWithLocale(truncFormatEtherStr(val?.after || '0'))} ${TOKEN}`}
                value={`${formatNumber(truncFormatEtherStr(val?.after || '0'))} ${TOKEN}`}
              ></EstimatedNextEraLayout>
            </div>

            {BigNumberJs(val?.after || '0').isZero() ? (
              <Tooltip
                title={
                  <Typography style={{ color: '#fff' }} variant="small">
                    You have either undelegated or redelegated your tokens away from this Node Operator, Please be aware
                    that your tokens will be locked for {hours} hours before you can withdraw them.
                    <Typography.Link
                      href="/profile/withdrawn"
                      variant="small"
                      style={{ color: '#fff', textDecoration: 'underline' }}
                    >
                      View Withdrawals
                    </Typography.Link>
                  </Typography>
                }
              >
                <InfoCircleOutlined style={{ color: 'var(--sq-info)', fontSize: 14 }} />
              </Tooltip>
            ) : (
              ''
            )}
          </div>
        );
      },
      sorter: (a, b) => {
        return +(a?.value?.after || 0) - +(b?.value?.after || 0);
      },
    },
    {
      title: <TableTitle title={'Total Rewards'} />,
      width: 200,
      dataIndex: 'totalRewards',
      render: (val, record) => {
        return (
          <div className="col-flex">
            <Typography>
              {
                <TokenAmount
                  tooltip={`${formatNumberWithLocale(formatSQT(val))} ${TOKEN}`}
                  value={formatNumber(formatSQT(val || '0'))}
                />
              }
            </Typography>
            <EstimatedNextEraLayout
              tooltip={`Last Era Rewards: ${formatNumberWithLocale(formatSQT(record.lastEraRewards || '0'))} ${TOKEN}`}
              value={`+ ${formatNumber(formatSQT(record.lastEraRewards || '0'))} ${TOKEN}`}
            ></EstimatedNextEraLayout>
          </div>
        );
      },
    },
    {
      title: <TableTitle title={t('general.status')} />,
      dataIndex: 'indexerActive',
      key: 'indexerActive',
      width: 100,
      render: (active: string, record) => {
        if (BigNumberJs(record.value.current).isZero() && !BigNumberJs(record.value?.after || '0').isZero()) {
          return (
            <Tooltip title="You must delegate for an entire Era before you start receiving any rewards.">
              <Tag color="processing">Pending</Tag>
            </Tooltip>
          );
        }
        const tagColor = active ? 'success' : 'default';
        const tagText = active ? t('general.active') : t('general.inactive');

        return <Tag color={tagColor}>{tagText}</Tag>;
      },
    },
    {
      title: <TableTitle title={t('indexer.action')} />,
      dataIndex: 'indexer',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: (id: string, record) => {
        return (
          <div className="flex" style={{ gap: 8 }}>
            <Dropdown
              menu={{
                items: [
                  {
                    label: (
                      <DoDelegate onSuccess={onSuccess} indexerAddress={id} variant="textBtn" btnText="Delegate more" />
                    ),
                    key: 'delegate',
                  },
                  {
                    label: (
                      <DoUndelegate
                        showBtnIfDisabled
                        initialUndelegateWay="anotherIndexer"
                        indexerAddress={id}
                        onSuccess={onSuccess}
                        indexerActive={record.indexerActive}
                      />
                    ),
                    key: 'Redelegate',
                  },
                  {
                    label: <DoUndelegate showBtnIfDisabled indexerAddress={id} onSuccess={onSuccess} />,
                    key: 'Undelegate',
                  },
                ],
              }}
            >
              <OutlineDot></OutlineDot>
            </Dropdown>
            {!record.indexerActive ? (
              <Tooltip title="This node operator has unregistered from SubQuery Network and you are receiving no more rewards. You should redelegate your SQT to another Node Operator to continue to receive rewards.">
                <InfoCircleOutlined style={{ color: 'var(--sq-error)', fontSize: 14 }} />
              </Tooltip>
            ) : (
              ''
            )}
            {BigNumberJs(record.capacity.after?.toString() || '999').isZero() ? (
              <Tooltip title="This node operator has reached its maximum delegation capacity. You are currently unable to delegate additional assets to this operator. Please consider redelegating your assets to another node operator to continue earning rewards">
                <InfoCircleOutlined style={{ color: 'var(--sq-error)' }} />
              </Tooltip>
            ) : (
              ''
            )}
          </div>
        );
      },
    },
  ];

  return {
    getColumns,
  };
};

const DelegatingCard = (props: {
  delegationList: {
    apy: string | bigint;
    lastDelegationEra: number;
  }[];
}) => {
  const { account } = useWeb3();
  const { currentEra } = useEra();
  const delegating = useDelegating(account ?? '');
  const delegatorApy = useGetDelegatorApiesQuery({
    variables: {
      delegator: account ?? '',
      era: currentEra.data?.index ? currentEra.data?.index - 1 : 0,
    },
  });

  const totalDelegatorRewards = useGetDelegatorTotalRewardsQuery({
    variables: {
      delegatorId: account ?? '',
    },
  });

  const rewards = useGetTotalRewardsAndUnclaimRewardsQuery({
    variables: {
      account: account || '',
    },
  });

  const totalWithdrawls = useGetTotalDelegationWithdrawlsQuery({
    variables: {
      delegator: account ?? '',
    },
  });

  const apy = React.useMemo(() => {
    const estimated = props.delegationList.every((i) => {
      const receiveRewardsEra = (i.lastDelegationEra || 0) + 2;
      return (currentEra.data?.index || 0) < receiveRewardsEra;
    });

    if (estimated)
      return (
        <Tooltip title={t('rewards.receiveRewardsInfo')}>
          <Typography>-</Typography>
        </Tooltip>
      );

    const realApy = (
      <Typography variant="small">
        {BigNumberJs(formatEther(delegatorApy.data?.eraDelegatorApies?.nodes?.[0]?.apy ?? '0'))
          .multipliedBy(100)
          .toFixed(2)}{' '}
        %
      </Typography>
    );

    return realApy;
  }, [delegatorApy.data?.eraDelegatorApies, props.delegationList]);

  return (
    <div className={`flex ${styles.delegationInfo}`}>
      <SubqlCard
        className={styles.newCard}
        title="Current Delegation"
        tooltip="The total amount that you have delegated to Node Operators"
        titleExtra={BalanceLayout({
          mainBalance: formatSQT(delegating.data?.curEra?.toString() ?? '0'),
          secondaryBalance: formatSQT(delegating.data?.nextEra.toString() ?? '0'),
        })}
      >
        <div className="col-flex">
          <div className="flex" style={{ marginBottom: 12 }}>
            <Typography variant="small" type="secondary" className="flex-center">
              Current Estimated APY
              <APYTooltip
                currentEra={currentEra?.data?.index}
                calculationDescription={
                  'This is estimated from your total rewards from delegation in the previous three Eras'
                }
              />
            </Typography>
            <span style={{ flex: 1 }}></span>
            {apy}
          </div>
          <FormatCardLine
            title="Total Delegation Rewards"
            amount={formatNumber(formatSQT(totalDelegatorRewards.data?.eraRewards?.aggregates?.sum?.amount ?? '0'))}
          ></FormatCardLine>
          <FormatCardLine
            title="Unclaimed Rewards"
            amount={formatNumber(formatSQT(rewards.data?.unclaimTotalRewards?.aggregates?.sum?.amount ?? '0'))}
            link="/profile/rewards"
            linkName="Claim Rewards"
          ></FormatCardLine>

          <FormatCardLine
            title="Total Delegation Withdrawals"
            amount={formatNumber(formatSQT(totalWithdrawls.data?.withdrawls?.aggregates?.sum?.amount ?? '0'))}
            link="/profile/withdrawn"
            linkName="View Withdrawals"
          ></FormatCardLine>
        </div>
      </SubqlCard>

      {
        <div className={`col-flex ${styles.rewardsLineChart}`}>
          <RewardsLineChart
            account={account}
            title="My Delegation Rewards"
            beDelegator
            onlyDelegator
            chartsStyle={{
              height: 340,
            }}
            skeletonHeight={340}
          ></RewardsLineChart>
        </div>
      }
    </div>
  );
};

export const MyDelegation: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const filterParams = { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 };
  const { getDisplayedCommission } = useMinCommissionRate();
  const { chatBoxRef } = useChatBoxStore();
  const { width } = useSize(document.querySelector('body')) || { width: 0 };
  const [fetchIndexerLeverageLimit] = useLazyQuery<{ cach: { value: string } }>(gql`
    query {
      cach(id: "indexerLeverageLimit") {
        value
      }
    }
  `);

  const currentLeverageLimit = useAsyncMemo(async () => {
    const leverageLimit = await limitContract(
      () => fetchIndexerLeverageLimit(),
      makeCacheKey('indexerLeverageLimit'),
      0,
    );

    if (!leverageLimit.data) return 12;

    return leverageLimit.data?.cach.value;
  }, []);

  const delegations = useGetFilteredDelegationsQuery({
    variables: filterParams,
    fetchPolicy: 'network-only',
  });

  const delegationApys = useGetSpecifyDelegatorsIndexerApyQuery({
    variables: {
      delegator: account ?? '',
      indexers: delegations.data?.delegations?.nodes.map((delegation) => delegation?.indexerId || '') ?? [],
      era: currentEra.data?.index ? currentEra.data?.index - 1 : 0,
    },
  });

  const delegationIndexerRewards = useGetDelegatorTotalAndLastEraDistictiveRewardsByIndexerQuery({
    variables: {
      delegator: account ?? '',
      indexers: delegations.data?.delegations?.nodes.map((delegation) => delegation?.indexerId || '') ?? [],
      era: currentEra.data?.index ? currentEra.data?.index - 1 : 0,
    },
  });

  const { getColumns } = useGetColumn({
    onSuccess: async () => {
      await delegations.refetch();
    },
  });

  const delegationList = mapAsync(
    ([delegations, era, delegationApys, delegationIndexerRewardsResult, leverageLimit]) =>
      delegations?.delegations?.nodes
        .filter(notEmpty)
        // TODO: sort by GraphQL
        .sort((a, b) => (`${a.id}` > `${b.id}` ? -1 : 1))
        .map((delegation) => {
          const totalRewards = delegationIndexerRewardsResult?.totalRewards?.groupedAggregates?.find((i) =>
            i.keys?.includes(delegation.indexerId),
          );
          const lastEraRewards = delegationIndexerRewardsResult?.lastEraCollectRewards?.groupedAggregates?.find((i) =>
            i.keys?.includes(delegation.indexerId),
          );

          const commssion = parseRawEraValue(delegation?.indexer?.commission, currentEra.data?.index);

          const stakeTotal = parseRawEraValue(delegation.indexer?.totalStake, currentEra.data?.index);
          const stakeSelf = parseRawEraValue(delegation.indexer?.selfStake, currentEra.data?.index);

          const capacity = {
            current: stakeSelf.current.mul(leverageLimit ?? 12).sub(stakeTotal.current),
            after: stakeSelf.after?.mul(leverageLimit ?? 12).sub(stakeTotal?.after ?? '0'),
          };

          return {
            value: mapEraValue(parseRawEraValue((delegation?.amount as RawEraValue) || '0', era?.index), (v) =>
              formatEther(v ?? 0),
            ),
            indexer: delegation.indexerId,
            commission: {
              current: getDisplayedCommission(
                BigNumberJs(commssion.current.toString()).div(PER_MILL).multipliedBy(100).toString(),
              ),
              after: getDisplayedCommission(
                BigNumberJs(commssion.after?.toString() || '0')
                  .div(PER_MILL)
                  .multipliedBy(100)
                  .toString(),
              ),
            },
            capacity: capacity,
            indexerActive: delegation?.indexer?.active,
            apy:
              delegationApys?.eraDelegatorIndexerApies?.nodes.find((i) => i?.indexerId === delegation.indexerId)?.apy ??
              '0',
            totalRewards: totalRewards?.sum?.reward.toString() ?? '0',
            lastEraRewards: lastEraRewards?.sum?.reward.toString() ?? '0',
            lastDelegationEra: (delegation?.amount?.era || 0) as number,
          };
        })
        .filter(
          (delegation) =>
            parseEther(delegation.value.current || '0').gt('0') || parseEther(delegation?.value?.after ?? '0').gt('0'),
        ),
    mergeAsync(delegations, currentEra, delegationApys, delegationIndexerRewards, currentLeverageLimit),
  );

  return (
    <>
      <AppPageHeader
        title={
          <div className="col-flex" style={{ gap: '8px' }}>
            <Typography variant="h5">My Delegation</Typography>
            <ChatBoxPlanTextTrigger triggerMsg="Give me advise on delegate" chatBoxInstance={chatBoxRef}>
              Give me advise on delegate.
            </ChatBoxPlanTextTrigger>
          </div>
        }
        desc={t('delegate.delegationDesc')}
      />
      <WalletRoute
        componentMode
        element={renderAsync(delegationList, {
          loading: () => <Spinner></Spinner>,
          error: (e) => {
            if (isRPCError(e)) {
              return <RpcError></RpcError>;
            }
            return <Typography>{`Failed to load delegations: ${e.message}`}</Typography>;
          },
          data: (data) => {
            if (!data || data.length === 0) {
              return (
                <EmptyList
                  title={t('delegate.nonDelegating')}
                  description={[t('delegate.nonDelegatingDesc1'), t('delegate.nonDelegatingDesc2')]}
                >
                  <Button>
                    <NavLink to={ROUTES.TOP_INDEXER_NAV}>{t('delegate.title')}</NavLink>
                  </Button>
                </EmptyList>
              );
            }
            return (
              <>
                <DelegatingCard delegationList={delegationList.data || []} />

                <Typography className={styles.header} style={{ marginBottom: 16 }}>
                  {t('delegate.totalAmount', { count: data.length || 0 })}
                </Typography>
                <Table
                  columns={getColumns(t)}
                  dataSource={data}
                  rowKey={'indexer'}
                  scroll={width <= 768 ? { x: 1600 } : undefined}
                />
              </>
            );
          },
        })}
      ></WalletRoute>
    </>
  );
};

export default MyDelegation;
