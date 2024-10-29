// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyList } from '@components/EmptyList';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { Spinner, TableTitle, Typography } from '@subql/components';
import { ServiceStatus } from '@subql/network-query';
import {
  renderAsync,
  useAsyncMemo,
  useGetDeploymentIndexersLazyQuery,
  useGetIndexerDeploymentLazyQuery,
} from '@subql/react-hooks';
import { formatSQT } from '@subql/react-hooks';
import { Pagination, Table, TableProps } from 'antd';
import { t } from 'i18next';

import { useProjectStore } from 'src/stores/project';

import { notEmpty, URLS } from '../../utils';
import { SearchInput } from '../SearchInput';
import styles from './IndexerDetails.module.less';
import Row from './Row';

type Props = {
  deploymentId: string | undefined;
  project: ProjectDetailsQuery;
  manifest?: Manifest;
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

const columns: TableProps<{ id: number }>['columns'] = [
  {
    width: '20%',
    title: <TableTitle title={t('indexers.head.indexers')} />,
    dataIndex: 'indexer',
  },
  {
    width: '25%',
    title: <TableTitle title={t('indexers.head.progress')} />,
    dataIndex: 'progress',
  },
  {
    width: '10%',
    title: <TableTitle title={t('indexers.head.status')} tooltip={t('indexers.tooltip.status')} />,
    dataIndex: 'status',
  },
  {
    width: '20%',
    title: <TableTitle title={t('indexers.head.url')} />,
    dataIndex: 'status',
  },
  {
    width: '20%',
    title: <TableTitle title={'Flex Plan Price'} />,
    dataIndex: 'flexPlanPrice',
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

const IndexerDetails: React.FC<Props> = ({ deploymentId, project, manifest }) => {
  const [loadIndexersLazy, asyncIndexers] = useGetDeploymentIndexersLazyQuery();
  const { getProjects } = useConsumerHostServices({ autoLogin: false });
  const { setProjectInfo } = useProjectStore();
  /**
   * SearchInput logic
   */
  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();
  const [queryParams, setQueryParams] = React.useState({
    offset: 0,
  });
  const totalCount = React.useMemo(() => {
    return asyncIndexers.data?.indexerDeployments?.totalCount || 0;
  }, [asyncIndexers]);

  const [search, sortedIndexer] = useGetIndexerDeploymentLazyQuery();

  const flexPlanPrice = useAsyncMemo(async () => {
    const res = await getProjects({
      projectId: `${parseInt(project.id)}`,
      deployment: deploymentId,
    });

    if (res?.data?.indexers) {
      return res.data.indexers;
    }

    return [];
  }, [deploymentId, project]);

  const searchedIndexer = React.useMemo(() => sortedIndexer?.data?.indexerDeployments?.nodes, [sortedIndexer]);

  const indexers = React.useMemo(
    () => asyncIndexers.data?.indexerDeployments?.nodes.filter(notEmpty),
    [asyncIndexers.data],
  );

  const indexerList = useMemo(() => {
    const list = searchedIndexer && searchedIndexer?.length > 0 ? searchedIndexer : indexers ?? [];

    return list.filter(notEmpty).map((i) => ({
      ...i,
      flexPlanPrice: flexPlanPrice.loading
        ? (false as const)
        : formatSQT(
            flexPlanPrice.data?.find((j) => j.indexer.toLowerCase() === i?.indexerId.toLowerCase())?.price || '0',
          ),
    }));
  }, [searchedIndexer, indexers, flexPlanPrice.data]);

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

  React.useEffect(() => {
    if (!deploymentId) return;
    setProjectInfo(deploymentId, {
      totalIndexers: totalCount,
    });
  }, [totalCount, deploymentId]);

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
              .sort((indexer) => (indexer.status === ServiceStatus.READY ? -1 : 1))
              .map((indexer) => (
                <Row
                  type={project.type}
                  rpcFamily={manifest?.rpcFamily}
                  indexer={indexer}
                  key={indexer.indexerId}
                  deploymentId={deploymentId}
                />
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
