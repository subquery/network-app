// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { GetDeploymentIndexers_deploymentIndexers_nodes } from '@__generated__/registry/GetDeploymentIndexers';
import { Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { Status } from '@subql/network-query';
import { Pagination, Table, TableProps } from 'antd';

import { useDeploymentIndexerQuery } from '../../containers';
import { notEmpty } from '../../utils';
import { SearchInput } from '../SearchInput';
import styles from './IndexerDetails.module.css';
import Row from './Row';

type Props = {
  indexers: GetDeploymentIndexers_deploymentIndexers_nodes[];
  deploymentId?: string;
  startBlock?: number;
  totalCount?: number;
  offset?: number;
  onLoadMore?: (offset: number) => void;
};

const IndexerDetails: React.FC<Props> = ({ indexers, startBlock, deploymentId, totalCount, offset, onLoadMore }) => {
  const { t } = useTranslation();

  /**
   * SearchInput logic
   */
  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();

  const sortedIndexer = useDeploymentIndexerQuery({
    indexerAddress: searchIndexer ?? '',
    deploymentId: deploymentId ?? '',
  });

  const searchedIndexer = React.useMemo(() => sortedIndexer?.data?.deploymentIndexers?.nodes, [sortedIndexer]);

  const SearchAddress = () => (
    <SearchInput
      onSearch={(value) => setSearchIndexer(value)}
      defaultValue={searchIndexer}
      loading={sortedIndexer.loading}
      emptyResult={!searchedIndexer}
    />
  );

  /**
   * SearchInput logic end
   */

  const indexerList = searchedIndexer && searchedIndexer?.length > 0 ? searchedIndexer : indexers ?? [];

  const columns: TableProps<any>['columns'] = [
    {
      width: '20%',
      title: <TableTitle title={t('indexers.head.indexers')} />,
      dataIndex: 'indexer',
    },
    {
      width: '30%',
      title: <TableTitle title={t('indexers.head.progress')} />,
      dataIndex: 'progress',
    },
    {
      width: '15%',
      title: <TableTitle title={t('indexers.head.status')} tooltip={t('indexers.tooltip.status')} />,
      dataIndex: 'status',
    },
    {
      width: '30%',
      title: <TableTitle title={t('indexers.head.url')} />,
      dataIndex: 'status',
    },
    {
      width: '5%',
      title: <TableTitle title={t('indexers.head.plans')} />,
      dataIndex: 'plans',
    },
  ];

  return (
    <>
      <div className={styles.indexerListHeader}>
        <Typography variant="h6" className={styles.title}>
          {t('indexer.amount', { count: totalCount || indexers?.length || 0 })}
        </Typography>
        <div className={styles.searchInput}>
          <SearchAddress />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={[{}]}
        pagination={false}
        rowKey="indexer"
        rowClassName={() => styles.tableHeader}
      />
      <>
        {indexerList
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
          total={searchIndexer ? indexerList.length : totalCount}
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
