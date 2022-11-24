// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BigNumber } from 'ethers';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { Space, Table, TableProps, Typography } from 'antd';
import i18next from 'i18next';
import { BsStarFill } from 'react-icons/bs';
import { useIndexerFlexPlans, IIndexerFlexPlans } from '../../../hooks';
import { Spinner, TableText } from '../../../components';
import { TableTitle } from '../../../components/TableTitle';
import { getFlexPlanPrice, mapAsync, notEmpty, renderAsyncArray } from '../../../utils';
import { EmptyList } from '../../plans/Plans/EmptyList';
import { ConnectedIndexer } from '../../../components/IndexerDetails/IndexerName';
import styles from './FlexPlans.module.css';

// TODO: confirm Validity Period with consumer host service
// TODO: confirm score threadThread with consumer host service
const columns: TableProps<IIndexerFlexPlans>['columns'] = [
  {
    dataIndex: 'indexer',
    title: <TableTitle>{i18next.t('explorer.flexPlans.indexer')}</TableTitle>,
    render: (indexer, indexerFlexPlans) => {
      return (
        <Space className="flex">
          <div className={styles.starContainer}>
            {indexerFlexPlans.score >= 150 && <BsStarFill className={styles.star} />}
          </div>
          <ConnectedIndexer id={indexer} />
        </Space>
      );
    },
  },
  {
    dataIndex: 'price',
    title: <TableTitle>{i18next.t('general.price')}</TableTitle>,
    render: (price) => <TableText content={getFlexPlanPrice(price)} />,
  },
  {
    dataIndex: 'max_time',
    title: <TableTitle>{i18next.t('flexPlans.validityPeriod')}</TableTitle>,
    render: (max) => <TableText content={max} />,
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
          error: (e) => <Typography>{`Failed to load flex plan: ${e}`}</Typography>,
          empty: () => <EmptyList i18nKey={'explorer.flexPlans.non'} />,
          data: (data) => {
            console.log('data', data);
            return <Table columns={columns} dataSource={data} rowKey={'id'} />;
          },
        },
      )}
    </>
  );
};
