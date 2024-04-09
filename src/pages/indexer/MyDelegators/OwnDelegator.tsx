// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useEra, useIsIndexer, useSortedIndexer } from '@hooks';
import { mapEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { useMinCommissionRate } from '@hooks/useMinCommissionRate';
import { SubqlCard, TableTitle } from '@subql/components';
import { Spinner, Typography } from '@subql/components';
import { renderAsyncArray, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { convertStringToNumber, mapAsync, mergeAsync, TOKEN } from '@utils';
import { formatNumber } from '@utils/numberFormatters';
import { retry } from '@utils/retry';
import { Table } from 'antd';
import { formatEther } from 'ethers/lib/utils';

import { SetCommissionRate } from '../MyStaking/SetCommissionRate';
import { NoDelegator } from './MyDelegators';
import styles from './OwnDelegator.module.css';

interface Props {
  indexer: string;
  showHeader?: boolean;
  showEmpty?: boolean;
  hideCard?: boolean;
}

export const OwnDelegator: React.FC<Props> = ({ indexer, showEmpty, hideCard, showHeader = false }) => {
  const { t } = useTranslation();
  const [pagination, setPagination] = React.useState({
    current: 1,
    offset: 0,
    first: 10,
  });
  const indexerDelegations = useGetIndexerDelegatorsQuery({ variables: { id: indexer ?? '', ...pagination } });

  const { currentEra } = useEra();
  const navigate = useNavigate();
  const sortedIndexer = useSortedIndexer(indexer || '');
  const isIndexer = useIsIndexer(indexer);
  const { getDisplayedCommission } = useMinCommissionRate();

  const columns = [
    {
      title: <TableTitle title={t('delegate.delegator')} />,
      dataIndex: 'delegator',
      render: (delegator: string) => (
        <ConnectedIndexer
          id={delegator}
          onClick={() => {
            navigate(`/profile/${delegator}`);
          }}
        ></ConnectedIndexer>
      ),
    },
    {
      title: <TableTitle title={t('delegate.amount')} />,
      dataIndex: 'value',
      render: (value: { current: number; after: number }) => {
        return (
          <div className="col-flex">
            <Typography>
              {formatNumber(value.current)} {TOKEN}
            </Typography>
            <div>
              <EstimatedNextEraLayout value={`${formatNumber(value.after)} ${TOKEN}`}></EstimatedNextEraLayout>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      {!hideCard && isIndexer.data && (
        <div>
          <SubqlCard
            title={
              <div style={{ width: '100%' }}>
                <div className="flex">
                  <Typography>Current Commission Rate</Typography>
                  <span style={{ flex: 1 }}></span>
                  <SetCommissionRate
                    onSuccess={() => {
                      retry(() => {
                        sortedIndexer.refresh?.();
                      });
                    }}
                  ></SetCommissionRate>
                </div>
              </div>
            }
            titleExtra={
              <div className="col-flex" style={{ gap: 2 }}>
                <Typography style={{ color: 'var(--sq-blue600)' }} variant="h5">
                  {getDisplayedCommission(sortedIndexer.data?.commission.current || '0')} %
                </Typography>

                <Typography variant="small" type="secondary">
                  {getDisplayedCommission(sortedIndexer.data?.commission.after || '0')} %
                </Typography>
              </div>
            }
            style={{ boxShadow: 'none', marginBottom: 24, width: 360 }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="medium" type="secondary">
                  Capacity
                </Typography>
                <Typography variant="medium">
                  {formatNumber(sortedIndexer.data?.capacity.current || '0')} {TOKEN}
                </Typography>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="medium" type="secondary">
                  {' '}
                </Typography>
                <Typography variant="small" type="secondary">
                  {formatNumber(sortedIndexer.data?.capacity.after || '0')} {TOKEN}
                </Typography>
              </div>
            </div>
          </SubqlCard>
        </div>
      )}
      {showEmpty ? (
        <NoDelegator />
      ) : (
        renderAsyncArray(
          mapAsync(
            ([sortedIndexer, era]) =>
              sortedIndexer?.indexer?.delegations.nodes.map((delegation) => ({
                value: mapEraValue(parseRawEraValue(delegation?.amount, era?.index), (v) =>
                  convertStringToNumber(formatEther(v ?? 0)),
                ),
                delegator: delegation?.delegatorId ?? '',
              })),
            mergeAsync(indexerDelegations, currentEra),
          ),
          // TODO: improve load experience
          {
            error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
            loading: () => <Spinner />,
            empty: () => <NoDelegator />,
            data: (data) => {
              return (
                <>
                  {showHeader && (
                    <div className="flex" style={{ marginBottom: 16 }}>
                      <Typography variant="large" weight={600}>
                        Node Operator's Delegators
                      </Typography>

                      <Typography variant="large" weight={600} type="secondary">
                        ({indexerDelegations.data?.indexer?.delegations.totalCount || 0})
                      </Typography>
                    </div>
                  )}
                  <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={'delegator'}
                    pagination={{
                      current: pagination.current,
                      total: indexerDelegations.data?.indexer?.delegations.totalCount,
                      pageSize: pagination.first,
                      onChange: (page, pageSize) => {
                        if (pageSize !== pagination.first) {
                          setPagination({
                            current: 1,
                            offset: 0,
                            first: pageSize,
                          });
                          return;
                        }

                        setPagination({
                          current: page,
                          offset: (page - 1) * pageSize,
                          first: pageSize,
                        });
                      },
                    }}
                  />
                </>
              );
            },
          },
        )
      )}
    </div>
  );
};
