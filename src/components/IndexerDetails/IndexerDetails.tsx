// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, TableProps, Pagination } from 'antd';
import { GetDeploymentIndexers_deploymentIndexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Row from './Row';
import { useTranslation } from 'react-i18next';
import styles from './IndexerDetails.module.css';
import { Status } from '../../__generated__/globalTypes';
import { notEmpty } from '../../utils';

type Props = {
  indexers: readonly DeploymentIndexer[];
  deploymentId?: string;
  startBlock?: number;
  totalCount?: number;
  offset?: number;
  onLoadMore?: (offset: number) => void;
};

const IndexerDetails: React.FC<Props> = ({ indexers, startBlock, deploymentId, totalCount, offset, onLoadMore }) => {
  const { t } = useTranslation();
  const columns: TableProps<any>['columns'] = [
    {
      width: '20%',
      title: t('indexers.head.indexers'),
      dataIndex: 'indexer',
    },
    {
      width: '30%',
      title: t('indexers.head.progress'),
      dataIndex: 'progress',
    },
    {
      width: '15%',
      title: t('indexers.head.status'),
      dataIndex: 'status',
    },
    {
      width: '30%',
      title: t('indexers.head.url'),
      dataIndex: 'status',
    },
    {
      width: '5%',
      title: t('indexers.head.plans'),
      dataIndex: 'plans',
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={[{}]}
        pagination={false}
        rowKey="indexer"
        rowClassName={() => styles.tableHeader}
      />
      <>
        {indexers
          .filter(notEmpty)
          .sort((indexer) => (indexer.status === Status.READY ? -1 : 1))
          .map((indexer, index) => (
            <Row indexer={indexer} key={index} startBlock={startBlock} deploymentId={deploymentId} />
          ))}
      </>
      <div className={styles.indexersPagination}>
        <Pagination
          defaultCurrent={1}
          current={(offset ?? 0) / 20 + 1}
          total={totalCount}
          defaultPageSize={20}
          pageSizeOptions={[]}
          onChange={(page, pageSize) => {
            onLoadMore?.((page - 1) * pageSize);
          }}
        />
      </div>
    </>
  );
};

export default IndexerDetails;
