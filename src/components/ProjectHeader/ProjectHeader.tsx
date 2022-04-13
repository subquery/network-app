// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectWithMetadata } from '../../models';
import Detail from '../Detail';
import { Address, Dropdown, Typography } from '@subql/react-ui';
import IPFSImage from '../IPFSImage';
import styles from './ProjectHeader.module.css';

type Props = {
  project: Required<ProjectWithMetadata>;
  versions?: Record<string, string>;
  currentVersion?: string;
  onChangeVersion?: (key: string) => void;
};

const ProjectHeader: React.VFC<Props> = ({ project, versions, currentVersion, onChangeVersion }) => {
  const { t } = useTranslation();

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
            {versions && (
              <Dropdown
                items={Object.entries(versions).map(([key, value]) => ({ key, label: value }))}
                onSelected={(key) => onChangeVersion?.(key)}
                selected={currentVersion ? Object.keys(versions).indexOf(currentVersion) : 0}
                colorScheme="neutral"
              />
            )}
          </div>
          <Address address={project.owner} size="small" />
        </div>
        <div className={styles.lower}>
          {/* <Detail label={t('projectHeader.id')} value={project.id} /> */}
          {currentVersion && (
            <>
              {/* <div className={styles.vertBar} /> */}
              <Detail label={t('projectHeader.deploymentId')} value={currentVersion} canCopy={true} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
