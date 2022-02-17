// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address } from '@subql/react-ui';
import * as React from 'react';
import { ProjectWithMetadata } from '../../models';
import IPFSImage from '../IPFSImage';
import styles from './ProjectCard.module.css';

type Props = {
  project: Pick<ProjectWithMetadata, 'id' | 'metadata' | 'owner'>;
  onClick?: () => void;
};

const ProjectCard: React.VFC<Props> = ({ project, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <IPFSImage src={project.metadata?.image || '/static/default.project.png'} className={styles.image} />
      <div className={styles.details}>
        <div className={styles.address}>
          <Address address={project.owner} size="small" />
        </div>
        <p className={styles.name}>{project.metadata?.name || project.id}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
