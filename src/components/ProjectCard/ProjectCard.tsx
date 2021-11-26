// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { ProjectWithMetadata } from '../../models';
import { truncateAddress } from '../../utils';
import IPFSImage from '../IPFSImage';
import styles from './ProjectCard.module.css';

type Props = {
  project: ProjectWithMetadata;
  onClick?: () => void;
};

const ProjectCard: React.VFC<Props> = ({ project, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <IPFSImage src={project.metadata?.image || '/static/default.project.png'} className={styles.image} />
      <div className={styles.creator}>
        <i className={['bi-person-fill', styles.creatorIcon].join(' ')} role="img" aria-label="PersonFill" />
        <span className={styles.creatorText}>{truncateAddress(project.owner.split('-')[0])}</span>
      </div>

      <span className={styles.name}>{project.metadata?.name || project.id}</span>
    </div>
  );
};

export default ProjectCard;
