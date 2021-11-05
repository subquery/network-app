// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { ProjectDetails } from '../../models';
import Detail from '../Detail';
import IPFSImage from '../IPFSImage';
import styles from './ProjectHeader.module.css';

type Props = {
  project: ProjectDetails;
};

const ProjectHeader: React.VFC<Props> = ({ project }) => {
  return (
    <div className={styles.container}>
      <div>
        <IPFSImage src={project.metadata.image || '/static/default.project.png'} className={styles.image} />
      </div>
      <div className={styles.inner}>
        <div className={styles.upper}>
          <span className={styles.name}>{project.metadata.name}</span>
          <div className={styles.owner}>
            <i className={['bi-person-fill', styles.ownerIcon].join(' ')} role="img" aria-label="PersonFill" />
            <p>{project.id}</p>
          </div>
        </div>
        <div className={styles.lower}>
          <Detail className={styles.lowerDetail} label="id" value={project.id} />
          {project.deployment && (
            <Detail
              className={styles.lowerDetail}
              label="deployment"
              value={project.deployment.id}
              href={`https://ipfs.io/ipfs/${project.deployment}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
