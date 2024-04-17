// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppPageHeader, Button, EmptyList, TableText, WalletRoute } from '@components';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { OutlineDot } from '@components/Icons/Icons';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import NewCard from '@components/NewCard';
import RpcError from '@components/RpcError';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { useEra } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '@hooks/useEraValue';
import { FormatCardLine } from '@pages/account';
import { BalanceLayout } from '@pages/dashboard';
import { RewardsLineChart } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { Spinner, TableTitle, Typography } from '@subql/components';
import {
  truncFormatEtherStr,
  useGetDelegatorApiesQuery,
  useGetDelegatorTotalRewardsQuery,
  useGetFilteredDelegationsQuery,
  useGetSpecifyDelegatorsIndexerApyQuery,
  useGetTotalDelegationWithdrawlsQuery,
  useGetTotalRewardsAndUnclaimRewardsQuery,
} from '@subql/react-hooks';
import { formatEther, isRPCError, mapAsync, mergeAsync, notEmpty, renderAsync, ROUTES, TOKEN } from '@utils';
import { formatNumber } from '@utils';
import { retry } from '@utils/retry';
import { Dropdown, Table, TableProps, Tag } from 'antd';
import BigNumberJs from 'bignumber.js';
import { parseEther } from 'ethers/lib/utils';
import { TFunction } from 'i18next';

import { formatSQT } from '../../utils/numberFormatters';
import { DoDelegate } from './DoDelegate';
import { DoUndelegate } from './DoUndelegate';
import styles from './MyDelegation.module.css';

const useGetColumn = ({ onSuccess }: { onSuccess?: () => void }) => {
  const navigate = useNavigate();
  const getColumns = (
    t: TFunction,
  ): TableProps<{
    value: CurrentEraValue<string>;
    indexer: string;
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
      title: <TableTitle title={t('delegate.yourDelegateAmount')} />,
      width: 200,
      dataIndex: 'value',
      render: (val) => {
        return (
          <div className="col-flex">
            <Typography>{<TokenAmount value={val?.current || '0'} />}</Typography>
            <EstimatedNextEraLayout
              value={`${truncFormatEtherStr(val?.after || '0')} ${TOKEN}`}
            ></EstimatedNextEraLayout>
          </div>
        );
      },
      sorter: (a, b) => {
        return +(a?.value?.after || 0) - +(b?.value?.after || 0);
      },
    },
    {
      title: <TableTitle title="Estimated Apy"></TableTitle>,
      width: 200,
      dataIndex: 'apy',
      render: (apy: string) => {
        return <Typography>{BigNumberJs(formatEther(apy)).toFixed(2)} %</Typography>;
      },
    },
    {
      title: <TableTitle title={t('general.status')} />,
      dataIndex: 'indexerActive',
      key: 'indexerActive',
      width: 100,
      render: (active: string) => {
        const tagColor = active ? 'success' : 'default';
        const tagText = active ? t('general.active').toUpperCase() : t('general.inactive').toUpperCase();

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
                  label: <DoUndelegate indexerAddress={id} onSuccess={onSuccess} />,
                  key: 'Undelegate',
                },
              ],
            }}
          >
            <OutlineDot></OutlineDot>
          </Dropdown>
        );
      },
    },
  ];

  return {
    getColumns,
  };
};
const account = '0xfc7583241241A494191B903B473333Add121Af54';

const DelegatingCard = () => {
  // const { account } = useWeb3();
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

  return (
    <div className="flex" style={{ margin: '24px 0' }}>
      <NewCard
        style={{ marginRight: 24, minWidth: 364, height: 340 }}
        title="Current Delegation"
        tooltip="The total amount that you have delegated to Node Operators"
        titleExtra={BalanceLayout({
          mainBalance: formatSQT(delegating.data?.curEra?.toString() ?? '0'),
          secondaryBalance: formatSQT(delegating.data?.nextEra.toString() ?? '0'),
        })}
      >
        <div className="col-flex">
          <div className="flex" style={{ marginBottom: 12 }}>
            <Typography variant="small" type="secondary">
              Current Estimated APY
            </Typography>
            <span style={{ flex: 1 }}></span>
            <Typography variant="small">
              {BigNumberJs(formatEther(delegatorApy.data?.eraDelegatorApies?.nodes?.[0]?.apy ?? '0')).toFixed(2)} %
            </Typography>
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
            title="Total Delegation Withdrawls"
            amount={formatNumber(formatSQT(totalWithdrawls.data?.withdrawls?.aggregates?.sum?.amount ?? '0'))}
            link="/profile/withdrawn"
            linkName="View Withdrawls"
          ></FormatCardLine>
        </div>
      </NewCard>

      {
        <div style={{ width: '100%' }}>
          <RewardsLineChart
            account={account}
            title="My Delegation Rewards"
            beDelegator
            onlyDelegator
            chartsStyle={{
              height: 340,
            }}
          ></RewardsLineChart>
        </div>
      }
    </div>
  );
};

export const MyDelegation: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();
  // const { account } = useWeb3();
  const filterParams = { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 };

  // TODO: refresh when do some actions.
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

  const { getColumns } = useGetColumn({
    onSuccess: () => {
      retry(
        () => {
          delegations.refetch();
        },
        {
          retryTime: 3,
        },
      );
    },
  });

  const delegationList = mapAsync(
    ([delegations, era, delegationApys]) =>
      delegations?.delegations?.nodes
        .filter(notEmpty)
        // TODO: sort by GraphQL
        .sort((a, b) => (`${a.id}` > `${b.id}` ? -1 : 1))
        .map((delegation) => ({
          value: mapEraValue(parseRawEraValue((delegation?.amount as RawEraValue) || '0', era?.index), (v) =>
            formatEther(v ?? 0),
          ),
          indexer: delegation.indexerId,
          indexerActive: delegation?.indexer?.active,
          apy:
            delegationApys?.eraDelegatorIndexerApies?.nodes.find((i) => i?.indexerId === delegation.indexerId)?.apy ??
            '0',
        }))
        .filter(
          (delegation) =>
            parseEther(delegation.value.current || '0').gt('0') || parseEther(delegation?.value?.after ?? '0').gt('0'),
        ),
    mergeAsync(delegations, currentEra, delegationApys),
  );
  const DelegationList = () => (
    <>
      {renderAsync(delegationList, {
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
              <Typography className={styles.header} style={{ marginBottom: 16 }}>
                {t('delegate.totalAmount', { count: data.length || 0 })}
              </Typography>
              <Table columns={getColumns(t)} dataSource={data} rowKey={'indexer'} />
            </>
          );
        },
      })}
    </>
  );

  return (
    <>
      <AppPageHeader title={t('delegate.delegating')} desc={t('delegate.delegationDesc')} />
      <WalletRoute
        componentMode
        element={
          <>
            <DelegatingCard />
            <DelegationList />
          </>
        }
      ></WalletRoute>
    </>
  );
};

export default MyDelegation;
