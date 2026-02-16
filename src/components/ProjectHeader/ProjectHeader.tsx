// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GetEndpoint from '@components/GetEndpoint';
import { IndexerName } from '@components/IndexerDetails/IndexerName';
import UnsafeWarn from '@components/UnsafeWarn';
import { useAccount } from '@containers/Web3';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { ProjectActionArgv } from '@pages/explorer/Project/type';
import { Tag, Typography } from '@subql/components';
import { ProjectType } from '@subql/network-query';
import { useAsyncMemo } from '@subql/react-hooks';
import { bytesToGb, formatNumber, formatSQT, TOKEN } from '@utils';
import { Button, Tooltip } from 'antd';
import { BigNumber } from 'bignumber.js';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { toSvg } from 'jdenticon';

import { getNetworkNameByChainId } from 'src/const/const';
import { useProjectStore } from 'src/stores/project';

import Detail from '../Detail';
import { Dropdown } from '../Dropdown';
import IPFSImage from '../IPFSImage';
import styles from './ProjectHeader.module.less';

type Props = {
  project: ProjectDetailsQuery;
  versions?: Record<string, string>;
  currentVersion?: string;
  onChangeVersion?: (key: string) => void;
  isUnsafeDeployment?: boolean;
  manifest?: Manifest;
};

const ProjectHeader: React.FC<Props> = ({
  project,
  versions,
  currentVersion,
  isUnsafeDeployment,
  onChangeVersion,
  manifest,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useAccount();
  const { projectDbSize, projectInfo } = useProjectStore();
  const { getStatisticQueries, getDominantPriceByDeployment } = useConsumerHostServices({ autoLogin: false });
  const [searchParams] = useSearchParams();
  const initialOpenModal = React.useMemo(() => {
    if (searchParams.get('action') === ProjectActionArgv.CREATE_PLAN) {
      return true;
    }
    return false;
  }, [searchParams]);
  const createdAtStr = React.useMemo(() => dayjs(project.createdTimestamp).utc(true).fromNow(), [project]);
  const updatedAtStr = React.useMemo(() => dayjs(project.updatedTimestamp).utc(true).fromNow(), [project]);

  const VersionDropdown = () => {
    if (!versions) return <></>;

    const menu = Object.entries(versions).map(([key, value]) => {
      const deployment = project.deployments.nodes.find((i) => i?.id === key);
      const booster =
        deployment?.deploymentBoosterSummariesByDeploymentId?.groupedAggregates?.[0]?.keys?.[0] === key
          ? deployment?.deploymentBoosterSummariesByDeploymentId?.groupedAggregates?.[0]?.sum?.totalAmount || '0'
          : '0';
      return {
        key,
        label: (
          <Typography style={{ maxWidth: 400 }} className="overflowEllipsis">{`${value} - Boost: ${formatNumber(
            formatSQT(booster),
          )}`}</Typography>
        ),
      };
    });

    const handleOnClick = (key: string) => {
      onChangeVersion?.(key);
    };

    return (
      <Dropdown
        menu={menu}
        handleOnClick={handleOnClick}
        dropdownContent={currentVersion ? versions[currentVersion] : versions[0]}
        styleProps={clsx(styles.dropdown)}
      />
    );
  };

  const networkVal = React.useMemo(() => {
    if (project.type === ProjectType.RPC && manifest?.rpcFamily) {
      return manifest?.rpcFamily[0];
    }

    const chainId =
      project.type === ProjectType.SUBQUERY ? manifest?.network?.chainId : manifest?.dataSources?.[0]?.network;
    if (!chainId) return '-';

    return (
      getNetworkNameByChainId(chainId, {
        projectName: project.metadata?.name,
        projectId: project.id,
        source: 'ProjectHeader',
      }) || chainId
    );
  }, [project.type, manifest, project.id, project.metadata?.name]);

  const isOnwer = React.useMemo(() => account === project.owner, [project.owner, account]);

  const dbSize = React.useMemo(() => {
    if (!currentVersion)
      return {
        average: '...',
        max: '...',
      };
    if (!projectInfo[currentVersion])
      return {
        average: '...',
        max: '...',
      };

    return {
      average: `${bytesToGb(projectDbSize[currentVersion || '']?.average)} Gb` || '...',
      max: `${bytesToGb(projectDbSize[currentVersion || '']?.max)} Gb` || '...',
    };
  }, [projectDbSize, currentVersion, projectInfo]);

  const yesterdayQueriesCount = useAsyncMemo(async () => {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');

    const res = await getStatisticQueries({
      deployment: [currentVersion || ''],
      start_date: yesterday.format('YYYY-MM-DD'),
      end_date: today.format('YYYY-MM-DD'),
    });

    if (BigNumber(res.data.total).isEqualTo(0)) {
      return '< 1,000';
    }

    return formatNumber(res.data.total, 0);
  }, [currentVersion]);

  const dominantPrice = useAsyncMemo(async () => {
    try {
      const res = await getDominantPriceByDeployment({
        deployment_list: [project.deploymentId],
      });

      return `${formatSQT(
        BigNumber(res.data[0].price || 0)
          .multipliedBy(1000)
          .toString(),
      )} ${TOKEN} / 1,000 requests`;
    } catch {
      return '...';
    }
  }, [project.type]);

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <IPFSImage
          src={
            project.metadata.image ||
            `data:image/svg+xml;utf8,${encodeURIComponent(toSvg(project?.metadata.name, 500))}`
          }
          className={styles.image}
        />
      </div>
      <div className={styles.inner}>
        <div className={styles.upper}>
          <div className={styles.titleVersion}>
            <Typography
              variant="h4"
              className={clsx(styles.name, 'overflowEllipsis')}
              weight={600}
              style={{ marginRight: 8, maxWidth: 500 }}
            >
              {project.metadata.name}
            </Typography>
            {isUnsafeDeployment && <UnsafeWarn></UnsafeWarn>}
            <VersionDropdown />
            <span style={{ flex: 1 }}></span>
            <div className={`flex ${styles.groupButton}`}>
              {isOnwer ? (
                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  onClick={() => {
                    navigate(`/projects/create?id=${project.id}`);
                  }}
                >
                  Edit
                </Button>
              ) : (
                ''
              )}
              <GetEndpoint
                deploymentId={currentVersion || ''}
                project={project}
                initialOpen={initialOpenModal}
              ></GetEndpoint>
            </div>
          </div>
          <IndexerName address={project.owner} size="tiny"></IndexerName>

          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* in case of someone skip the legal process add more than 2 categories */}
            {project.metadata.categories &&
              project.metadata.categories.slice(0, 2).map((val) => {
                return (
                  <Button key={val} type="primary" shape="round" className={clsx('staticButton', 'overflowEllipsis')}>
                    <span className="overflowEllipsis" style={{ maxWidth: 300 }}>
                      {val}
                    </span>
                  </Button>
                );
              })}
          </div>
        </div>
        <div className={styles.lower}>
          <Detail
            label="Network"
            value={networkVal.length > 10 ? `${networkVal.slice(0, 10)}...` : networkVal}
            capitalize
          ></Detail>
          <Detail
            label="Type"
            value={
              {
                [ProjectType.LLM]: 'LLM',
                [ProjectType.RPC]: 'RPC Endpoint',
                [ProjectType.SUBQUERY]: 'Indexed Dataset',
                [ProjectType.SQ_DICT]: 'Dictionary',
                [ProjectType.SUBGRAPH]: (
                  <Tag style={{ background: '#6B46EF', color: '#fff', border: '1px solid #DFE3E880' }}>Subgraph</Tag>
                ),
              }[project.type] || ''
            }
          ></Detail>
          {currentVersion && (
            <Detail label={t('projectHeader.deploymentId')} value={currentVersion} canCopy={true} isTruncate={true} />
          )}
          <Detail label={t('projectOverview.updatedAt')} value={updatedAtStr} className={styles.column} />
          <Detail label={t('projectOverview.createdAt')} value={createdAtStr} className={styles.column} />
          {project.type === ProjectType.SUBQUERY ? (
            <Detail
              label={'DbSize'}
              value={
                <Tooltip title={`Max: ${dbSize.max}, Average: ${dbSize.average}`}>
                  <Typography>{dbSize.average}</Typography>
                </Tooltip>
              }
              className={styles.column}
            />
          ) : (
            ''
          )}
          <Detail label={'Queries (Yesterday)'} value={<Typography>{yesterdayQueriesCount.data}</Typography>}></Detail>
          <Detail label={'Dominant Price'} value={<Typography>{dominantPrice.data}</Typography>}></Detail>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
