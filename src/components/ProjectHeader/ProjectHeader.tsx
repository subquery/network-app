// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { ProjectWithMetadata } from '../../models';
import { truncateAddress } from '../../utils';
import Detail from '../Detail';
import Dropdown from '../Dropdown';
import IPFSImage from '../IPFSImage';
import styles from './ProjectHeader.module.css';

type Props = {
  project: Required<ProjectWithMetadata>;
  versions?: Record<string, string>;
  currentVersion?: string;
  onChangeVersion?: (key: string) => void;
};

const ProjectHeader: React.VFC<Props> = ({ project, versions, currentVersion, onChangeVersion }) => {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <IPFSImage src={project.metadata.image || '/static/default.project.png'} className={styles.image} />
      </div>
      <div className={styles.inner}>
        <div className={styles.upper}>
          <div className={styles.titleVersion}>
            <span className={styles.name}>{project.metadata.name}</span>
            {versions && (
              <Dropdown
                items={Object.entries(versions).map(([key, value]) => ({ key, label: value }))}
                onSelected={(key) => onChangeVersion?.(key)}
                selected={currentVersion ? Object.keys(versions).indexOf(currentVersion) : 0}
              />
            )}
          </div>
          <div className={styles.owner}>
            <i className={['bi-person-fill', styles.ownerIcon].join(' ')} role="img" aria-label="PersonFill" />
            <p>{truncateAddress(project.owner)}</p>
          </div>
        </div>
        <div className={styles.lower}>
          <Detail label="id" value={project.id} />
          <div className={styles.vertBar} />
          <Detail label="Deployment ID" value={currentVersion} />
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
