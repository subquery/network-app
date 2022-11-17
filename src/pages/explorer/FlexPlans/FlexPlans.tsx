// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BigNumber } from 'ethers';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { Table, TableProps, Typography } from 'antd';
import i18next from 'i18next';
import { useIndexerFlexPlans, IIndexerFlexPlans } from '../../../hooks';
import { Spinner, TableText } from '../../../components';
import { TableTitle } from '../../../components/TableTitle';
import { formatEther, mapAsync, notEmpty, renderAsyncArray, TOKEN } from '../../../utils';
import { EmptyList } from '../../plans/Plans/EmptyList';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';

// TODO: confirm PRICE / Validity Period with consumer host service
const columns: TableProps<IIndexerFlexPlans>['columns'] = [
  {
    dataIndex: 'indexer',
    title: <TableTitle>{i18next.t('explorer.flexPlans.indexer')}</TableTitle>,
    render: (indexer) => <ConnectedIndexer id={indexer} />,
  },
  {
    dataIndex: 'price',
    title: <TableTitle>{i18next.t('general.price')}</TableTitle>,
    render: (price, indexerFlexPlans) => {
      const sortedPrice = `${formatEther(price, 4)} ${TOKEN}`;
      const sortedRequest = `${indexerFlexPlans?.max_time} requests`;

      return <TableText content={`${sortedPrice} / ${sortedRequest}`} />;
    },
  },

  {
    dataIndex: 'id',
    title: <TableTitle>{i18next.t('general.action')}</TableTitle>,
    render: (id) => {
      return <TableText content={'purchase'} />;
    },
  },
];

export const FlexPlans: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const flexPlans = useIndexerFlexPlans(BigNumber.from(id).toString());

  React.useEffect(() => {
    if (!id) {
      history.push('/explorer');
    }
  }, [history, id]);

  return (
    <>
      {renderAsyncArray(
        mapAsync((d) => d.filter(notEmpty), flexPlans),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load user service agreements: ${e}`}</Typography>,
          empty: () => <EmptyList i18nKey={'explorer.flexPlans.non'} />,
          data: (data) => {
            return <Table columns={columns} dataSource={data} rowKey={'id'} />;
          },
        },
      )}
    </>
  );
};
