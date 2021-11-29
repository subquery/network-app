// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { ProjectWithMetadata } from '../../models';
import IPFSImage from '../IPFSImage';
import styles from './ProjectCard.module.css';
import Address from '../Address';

type Props = {
  project: ProjectWithMetadata;
  onClick?: () => void;
};

const ProjectCard: React.VFC<Props> = ({ project, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <IPFSImage src={project.metadata?.image || '/static/default.project.png'} className={styles.image} />
      <Address address={project.owner} size="small" />
      <span className={styles.name}>{project.metadata?.name || project.id}</span>
    </div>
  );
};

export default ProjectCard;
