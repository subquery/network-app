// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import DoBooster from '@components/DoBooster';
import GetEndpoint from '@components/GetEndpoint';
import UnsafeWarn from '@components/UnsafeWarn';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { Address, Typography } from '@subql/components';
import { ProjectType } from '@subql/network-query';
import { formatNumber, formatSQT } from '@utils';
import { Button } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';

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
          <Typography style={{ maxWidth: 400 }} className="overflowEllipsis">{`${value} - Booster: ${formatNumber(
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

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <IPFSImage src={project.metadata.image || '/static/default.project.png'} className={styles.image} />
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
            <div className="flex" style={{ gap: 10 }}>
              <DoBooster projectId={project.id} deploymentId={currentVersion}></DoBooster>
              <GetEndpoint deploymentId={currentVersion || ''} project={project}></GetEndpoint>
            </div>
          </div>
          <Address address={project.owner} size="small" />

          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* in case of someone skip the legal process add more than 2 categories */}
            {project.metadata.categories &&
              project.metadata.categories.slice(2).map((val) => {
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
          {project.type === ProjectType.RPC && manifest?.rpcFamily ? (
            <Detail label="Network" value={manifest?.rpcFamily[0]}></Detail>
          ) : (
            ''
          )}
          <Detail label="Type" value={project.type === ProjectType.RPC ? 'RPC Endpoint' : 'Indexed Dataset'}></Detail>
          {currentVersion && <Detail label={t('projectHeader.deploymentId')} value={currentVersion} canCopy={true} />}
          <Detail label={t('projectOverview.updatedAt')} value={updatedAtStr} className={styles.column} />
          <Detail label={t('projectOverview.createdAt')} value={createdAtStr} className={styles.column} />
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
