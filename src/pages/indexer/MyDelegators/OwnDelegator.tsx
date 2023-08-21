// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useEra } from '@hooks';
import { mapEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { TableTitle } from '@subql/components';
import { Spinner, Typography } from '@subql/components';
import { renderAsyncArray, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { convertStringToNumber, mapAsync, mergeAsync, TOKEN } from '@utils';
import { formatNumber } from '@utils/numberFormatters';
import { Table } from 'antd';
import { formatEther } from 'ethers/lib/utils';

import styles from './OwnDelegator.module.css';

interface Props {
  indexer: string;
  showHeader?: boolean;
}

export const OwnDelegator: React.FC<Props> = ({ indexer, showHeader = false }) => {
  const { t } = useTranslation();
  const indexerDelegations = useGetIndexerDelegatorsQuery({ variables: { id: indexer ?? '', offset: 0 } });
  const { currentEra } = useEra();

  const columns = [
    {
      title: <TableTitle title={t('delegate.delegator')} />,
      dataIndex: 'delegator',
      render: (delegator: string) => <ConnectedIndexer id={delegator}></ConnectedIndexer>,
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
            <Typography type="secondary" variant="small">
              {formatNumber(value.after)} {TOKEN}
            </Typography>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      {renderAsyncArray(
        mapAsync(
          ([sortedIndexer, era]) =>
            sortedIndexer?.indexer?.delegations.nodes
              .map((delegation) => ({
                value: mapEraValue(parseRawEraValue(delegation?.amount, era?.index), (v) =>
                  convertStringToNumber(formatEther(v ?? 0)),
                ),
                delegator: delegation?.delegatorId ?? '',
              }))
              .filter((delegation) => delegation.value.current !== 0 || delegation.value.after !== 0),
          mergeAsync(indexerDelegations, currentEra),
        ),
        {
          error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography>{t('delegate.none')}</Typography>,
          data: (data) => {
            return (
              <>
                {showHeader && (
                  <div className="flex" style={{ marginBottom: 16 }}>
                    <Typography variant="large" weight={600}>
                      Indexer's Delegators
                    </Typography>

                    <Typography variant="large" weight={600} type="secondary">
                      ({data.length})
                    </Typography>
                  </div>
                )}
                <Table columns={columns} dataSource={data} rowKey={'delegator'} />
              </>
            );
          },
        },
      )}
    </div>
  );
};
