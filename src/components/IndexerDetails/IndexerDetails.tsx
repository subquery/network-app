// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyList } from '@components/EmptyList';
import { Spinner, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { Status } from '@subql/network-query';
import { renderAsync, useGetDeploymentIndexerLazyQuery, useGetDeploymentIndexersLazyQuery } from '@subql/react-hooks';
import { Pagination, Table, TableProps } from 'antd';

import { notEmpty, URLS } from '../../utils';
import { SearchInput } from '../SearchInput';
import styles from './IndexerDetails.module.less';
import Row from './Row';

type Props = {
  deploymentId: string | undefined;
};

const NoIndexers: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList
      title={t('noIndexers.title')}
      description={t('noIndexers.description')}
      infoLinkDesc={t('noIndexers.subtitle')}
      infoI18nKey={t('noIndexers.subtitle')}
      infoLink={URLS.INDEXER}
    />
  );
};

const IndexerDetails: React.FC<Props> = ({ deploymentId }) => {
  const { t } = useTranslation();

  const [loadIndexersLazy, asyncIndexers] = useGetDeploymentIndexersLazyQuery();

  /**
   * SearchInput logic
   */
  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();
  const [queryParams, setQueryParams] = React.useState({
    offset: 0,
  });
  const totalCount = React.useMemo(() => {
    return asyncIndexers.data?.deploymentIndexers?.totalCount || 0;
  }, [asyncIndexers]);

  // actually i think this need to be refactor, but it works well except not lazy= =.
  // and indexers query didn't have indexer address filter now. so continue use this for now.
  const [search, sortedIndexer] = useGetDeploymentIndexerLazyQuery();

  const searchedIndexer = React.useMemo(() => sortedIndexer?.data?.deploymentIndexers?.nodes, [sortedIndexer]);

  const indexers = React.useMemo(
    () => asyncIndexers.data?.deploymentIndexers?.nodes.filter(notEmpty),
    [asyncIndexers.data],
  );

  const SearchAddress = () => (
    <SearchInput
      onSearch={(value) => {
        setSearchIndexer(value);
        if (deploymentId) {
          search({
            variables: {
              indexerAddress: value,
              deploymentId: deploymentId,
            },
          });
        }
      }}
      defaultValue={searchIndexer}
      loading={sortedIndexer.loading}
      emptyResult={!searchedIndexer}
    />
  );

  /**
   * SearchInput logic end
   */

  const indexerList = searchedIndexer && searchedIndexer?.length > 0 ? searchedIndexer : indexers ?? [];

  const columns: TableProps<{ id: number }>['columns'] = [
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
      width: '20%',
      title: <TableTitle title={t('indexers.head.url')} />,
      dataIndex: 'status',
    },
    {
      width: '10%',
      title: <TableTitle title={t('indexers.head.playground')} />,
    },
    {
      width: '5%',
      title: <TableTitle title={t('indexers.head.plans')} />,
      dataIndex: 'plans',
    },
  ];

  React.useEffect(() => {
    if (deploymentId) {
      loadIndexersLazy({
        variables: { deploymentId, offset: 0 },
      });

      setQueryParams({
        offset: 0,
      });
    }
  }, [deploymentId]);

  return renderAsync(asyncIndexers, {
    loading: () => <Spinner />,
    error: (e) => <div>{`Failed to load indexers: ${e.message}`}</div>,
    data: () => {
      if (!indexers?.length) {
        return <NoIndexers />;
      }
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
          {/* TODO: refactor */}
          {/* Looks like weired= =. */}
          <Table
            columns={columns}
            dataSource={[{ id: 1 }]}
            pagination={false}
            rowKey="id"
            rowClassName={() => styles.tableHeader}
          />
          <>
            {indexerList
              .filter(notEmpty)
              .sort((indexer) => (indexer.status === Status.READY ? -1 : 1))
              .map((indexer) => (
                <Row indexer={indexer} key={indexer.indexerId} deploymentId={deploymentId} />
              ))}
          </>
          <div className={styles.indexersPagination}>
            <Pagination
              defaultCurrent={1}
              current={(queryParams.offset ?? 0) / 20 + 1}
              total={searchIndexer ? indexerList.length : totalCount}
              defaultPageSize={20}
              pageSizeOptions={[]}
              onChange={(page, pageSize) => {
                if (deploymentId) {
                  loadIndexersLazy({
                    variables: { deploymentId, offset: (page - 1) * pageSize },
                  });
                  setQueryParams({
                    offset: (page - 1) * pageSize,
                  });
                }
              }}
            />
          </div>
        </>
      );
    },
  });
};

export default IndexerDetails;
