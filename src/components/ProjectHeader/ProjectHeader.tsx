// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectWithMetadata } from '../../models';
import Detail from '../Detail';
import { Address, Typography } from '@subql/components';
import IPFSImage from '../IPFSImage';
import styles from './ProjectHeader.module.css';
import { Dropdown } from '../Dropdown';

type Props = {
  project: Required<ProjectWithMetadata>;
  versions?: Record<string, string>;
  currentVersion?: string;
  onChangeVersion?: (key: string) => void;
};

const ProjectHeader: React.FC<Props> = ({ project, versions, currentVersion, onChangeVersion }) => {
  const { t } = useTranslation();

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
            <Typography variant="h4" className={styles.name}>
              {project.metadata.name}
            </Typography>
            <VersionDropdown />
          </div>
          <Address address={project.owner} size="small" />
        </div>
        <div className={styles.lower}>
          {currentVersion && <Detail label={t('projectHeader.deploymentId')} value={currentVersion} canCopy={true} />}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
