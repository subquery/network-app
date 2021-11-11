// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectWithMetadata } from '../../models';
import { truncateAddress } from '../../utils';
import IPFSImage from '../IPFSImage';
import styles from './ProjectCard.module.css';

type Props = {
  project: ProjectWithMetadata;
  onClick?: () => void;
};

const ProjectCard: React.VFC<Props> = ({ project, onClick }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.card} onClick={onClick}>
      <IPFSImage src={project.metadata?.image || '/static/default.project.png'} className={styles.image} />

      <h3>{project.metadata?.name || project.id}</h3>

      <div className={styles.creator}>
        <i className={['bi-person-fill', styles.creatorIcon].join(' ')} role="img" aria-label="PersonFill" />
        <h5>{truncateAddress(project.owner.split('-')[0])}</h5>
      </div>

      {/* TODO subtitle */}

      {project.metadata?.description ? (
        <p className={styles.description}>{project.metadata?.description}</p>
      ) : (
        <p className={styles.noDescription}>{t('projectCard.noDescription')}</p>
      )}

      {/* TODO get status*/}
      <div className={styles.footer}>
        <h5 className={styles.status}>Status</h5>
        <h5>Last Updated</h5>
      </div>
    </div>
  );
};

export default ProjectCard;
