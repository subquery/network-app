// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyList } from '@components/EmptyList';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import useIndexerGeoInformation from '@hooks/useIndexerGeoInformation';
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
import { Pagination, Skeleton, Table, TableProps, Tooltip } from 'antd';
import { t } from 'i18next';
import { groupBy } from 'lodash-es';

import { useProjectStore } from 'src/stores/project';

import { notEmpty, URLS } from '../../utils';
import { SearchInput } from '../SearchInput';
import styles from './IndexerDetails.module.less';
import { PriceQueriesChart } from './PriceQueries';
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
    width: '18%',
    title: <TableTitle title={t('indexers.head.indexers')} />,
    dataIndex: 'indexer',
  },
  {
    width: '15%',
    title: <TableTitle title={t('indexers.head.progress')} />,
    dataIndex: 'progress',
  },
  {
    width: '10%',
    title: <TableTitle title={t('indexers.head.status')} tooltip={t('indexers.tooltip.status')} />,
    dataIndex: 'status',
  },
  {
    width: '12%',
    title: <TableTitle title={t('indexers.head.url')} />,
    dataIndex: 'status',
  },
  {
    width: '15%',
    title: <TableTitle title={'Flex Plan Price'} />,
    dataIndex: 'flexPlanPrice',
  },
  {
    width: '15%',
    title: <TableTitle title={'Location'} />,
    dataIndex: 'location',
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

const ComposableMap = React.lazy(() =>
  import('react-simple-maps').then((module) => ({ default: module.ComposableMap })),
);
const Geographies = React.lazy(() => import('react-simple-maps').then((module) => ({ default: module.Geographies })));
const Geography = React.lazy(() => import('react-simple-maps').then((module) => ({ default: module.Geography })));
const Marker = React.lazy(() => import('react-simple-maps').then((module) => ({ default: module.Marker })));

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

  const indexerIds = useMemo(() => indexers?.map((i) => i.indexerId), [indexers]);

  const geoInfo = useIndexerGeoInformation(indexerIds);

  const groupGeoInfo = useMemo(() => {
    if (geoInfo.data) {
      return groupBy(geoInfo.data, (i) => [i.location?.longitude, i.location?.latitude]);
    }

    return {};
  }, [geoInfo.data]);

  const indexerList = useMemo(() => {
    const list = searchedIndexer && searchedIndexer?.length > 0 ? searchedIndexer : indexers ?? [];

    return list.filter(notEmpty).map((i) => {
      const findGeo = geoInfo.data?.find((j) => j.indexer === i.indexerId);
      return {
        ...i,
        flexPlanPrice: flexPlanPrice.loading
          ? (false as const)
          : formatSQT(
              flexPlanPrice.data?.find((j) => j.indexer.toLowerCase() === i?.indexerId.toLowerCase())?.price || '0',
            ),
        location: geoInfo.loading
          ? 'loading'
          : findGeo?.country?.names?.en
            ? [findGeo.country.names?.en, findGeo.city?.names?.en].filter((__) => __).join(', ')
            : 'Unknown',
      };
    });
  }, [searchedIndexer, indexers, flexPlanPrice.data, geoInfo.loading, geoInfo.data]);

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
          <div className="flex" style={{ gap: 24, alignItems: 'normal' }}>
            <React.Suspense
              fallback={
                <Skeleton
                  active
                  paragraph={{ rows: 8 }}
                  style={{ height: 'auto', width: '50%', flexShrink: '0' }}
                ></Skeleton>
              }
            >
              <div
                className="col-flex"
                style={{
                  borderRadius: 8,
                  border: '1px solid var(--card-boder, rgba(223, 227, 232, 0.6))',
                  padding: 24,
                  width: '50%',
                }}
              >
                <Typography weight={600} variant="large">
                  Node Operator Locations
                </Typography>
                <ComposableMap
                  style={{
                    width: '100%',
                  }}
                >
                  <Geographies geography="/static/geo.json">
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography key={geo.rsmKey} geography={geo} fill="#DFE3E8" stroke="#9d8e8e" />
                      ))
                    }
                  </Geographies>
                  {Object.keys(groupGeoInfo)
                    .filter((i) => i !== ',')
                    .map((geo, index) => {
                      const title = groupGeoInfo[geo].map((i) => i.name).join(', ');
                      const item = groupGeoInfo[geo][0];
                      return (
                        <Tooltip key={index} title={title}>
                          <Marker coordinates={[item.location?.longitude || 0, item.location?.latitude || 0]}>
                            <g
                              fill="transparent"
                              stroke="#4388DD"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              transform="translate(-12, -24)"
                            >
                              <circle cx="12" cy="10" r="3" />
                              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                            </g>
                            <text
                              textAnchor="middle"
                              y={15}
                              className="geoText"
                              style={{ fontFamily: 'system-ui', fill: '#5D5A6D' }}
                            >
                              {[item?.country?.names?.en, item?.city?.names?.en].filter((i) => i).join(', ')}
                            </text>
                          </Marker>
                        </Tooltip>
                      );
                    })}
                </ComposableMap>
              </div>
            </React.Suspense>

            <div
              style={{
                width: '50%',
              }}
            >
              <PriceQueriesChart flexPlanPrice={flexPlanPrice.data} deploymentId={deploymentId}></PriceQueriesChart>
            </div>
          </div>
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
