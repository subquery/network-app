// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, TableProps } from 'antd';
import { GetDeploymentIndexers_deploymentIndexers_nodes as DeploymentIndexer } from '../../__generated__/GetDeploymentIndexers';
import Row from './Row';
import { useTranslation } from 'react-i18next';
import styles from './IndexerDetails.module.css';

type Props = {
  indexers: readonly DeploymentIndexer[];
  deploymentId?: string;
  startBlock?: number;
};

const IndexerDetails: React.FC<Props> = ({ indexers, startBlock, deploymentId }) => {
  const { t } = useTranslation();
  const columns: TableProps<any>['columns'] = [
    {
      width: '20%',
      title: t('indexers.head.indexers'),
      dataIndex: 'indexer',
      align: 'center',
    },
    {
      width: '30%',
      title: t('indexers.head.progress'),
      dataIndex: 'progress',
      align: 'center',
    },
    {
      width: '20%',
      title: t('indexers.head.status'),
      dataIndex: 'status',
      align: 'center',
    },
    {
      width: '20%',
      title: t('indexers.head.url'),
      dataIndex: 'status',
      align: 'center',
    },
    {
      width: '10%',
      title: t('indexers.head.plans'),
      dataIndex: 'plans',
      align: 'center',
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
        {indexers.map((indexer, index) => (
          <Row indexer={indexer} key={index} startBlock={startBlock} deploymentId={deploymentId} />
        ))}
      </>
    </>
  );
};

export default IndexerDetails;
