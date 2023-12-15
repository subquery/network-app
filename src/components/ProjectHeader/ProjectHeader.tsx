// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import UnsafeWarn from '@components/UnsafeWarn';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { Address, Typography } from '@subql/components';
import { Button } from 'antd';
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
};

const ProjectHeader: React.FC<Props> = ({ project, versions, currentVersion, isUnsafeDeployment, onChangeVersion }) => {
  const { t } = useTranslation();

  const createdAtStr = React.useMemo(() => dayjs(project.createdTimestamp).fromNow(), [project]);
  const updatedAtStr = React.useMemo(() => dayjs(project.updatedTimestamp).fromNow(), [project]);

  const VersionDropdown = () => {
    if (!versions) return <></>;

    const menu = Object.entries(versions).map(([key, value]) => ({ key, label: value }));

    const handleOnClick = (key: string) => {
      onChangeVersion?.(key);
    };

    return (
      <Dropdown
        menu={menu}
        handleOnClick={handleOnClick}
        dropdownContent={currentVersion ? versions[currentVersion] : versions[0]}
        styleProps={styles.dropdown}
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
            <Typography variant="h4" className={styles.name} weight={600} style={{ marginRight: 8 }}>
              {project.metadata.name}
            </Typography>
            {isUnsafeDeployment && <UnsafeWarn></UnsafeWarn>}
            <VersionDropdown />
          </div>
          <Address address={project.owner} size="small" />

          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {project.metadata.categories &&
              project.metadata.categories.map((val) => {
                return (
                  <Button key={val} type="primary" shape="round" className="staticButton">
                    {val}
                  </Button>
                );
              })}
          </div>
        </div>
        <div className={styles.lower}>
          {currentVersion && <Detail label={t('projectHeader.deploymentId')} value={currentVersion} canCopy={true} />}
          <Detail label={t('projectOverview.updatedAt')} value={updatedAtStr} className={styles.column} />
          <Detail label={t('projectOverview.createdAt')} value={createdAtStr} className={styles.column} />
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
