// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppPageHeader, Button, Card, EmptyList, TableText, WalletRoute } from '@components';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { OutlineDot } from '@components/Icons/Icons';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import RpcError from '@components/RpcError';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { useEra } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '@hooks/useEraValue';
import { Spinner, TableTitle } from '@subql/components';
import {
  truncFormatEtherStr,
  useGetFilteredDelegationsQuery,
  useGetSpecifyDelegatorsIndexerApyQuery,
} from '@subql/react-hooks';
import { formatEther, isRPCError, mapAsync, mergeAsync, notEmpty, renderAsync, ROUTES, TOKEN } from '@utils';
import { retry } from '@utils/retry';
import { Dropdown, Table, TableProps, Tag, Typography } from 'antd';
import BigNumberJs from 'bignumber.js';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { TFunction } from 'i18next';

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
          <div>
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

export const MyDelegation: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const delegating = useDelegating(account ?? '');
  const delegatingAmount = `${formatEther(delegating.data ?? BigNumber.from(0), 4)} ${TOKEN}`;
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
            delegationApys?.eraDelegatorIndexerAPYs?.nodes.find((i) => i?.indexerId === delegation.indexerId)?.apy ??
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
              <Typography.Title level={3} className={styles.header}>
                {t('delegate.totalAmount', { count: data.length || 0 })}
              </Typography.Title>
              <Table columns={getColumns(t)} dataSource={data} rowKey={'indexer'} />
            </>
          );
        },
      })}
    </>
  );

  const DelegatingCard = () => {
    return (
      <div className={styles.delegatingCard}>
        <Card title={t('delegate.delegationAmountTitle')} value={delegatingAmount} />
      </div>
    );
  };

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
