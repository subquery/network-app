// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Address, Typography } from '@subql/components';
import { ProjectFieldsFragment } from '@subql/network-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { ProjectMetadata } from 'src/models';

import IPFSImage from '../IPFSImage';
import styles from './ProjectCard.module.css';

dayjs.extend(relativeTime);

type Props = {
  project: { metadata: ProjectMetadata | undefined } & Omit<ProjectFieldsFragment, 'metadata'>;
  onClick?: () => void;
};

const ProjectCard: React.FC<Props> = ({ project, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <IPFSImage src={project.metadata?.image || '/static/default.project.png'} className={styles.image} />
      <div style={{ flex: 1 }}>
        <Typography style={{ marginTop: 16, marginBottom: 6 }} weight={600}>
          {project.metadata?.name || project.id}
        </Typography>
      </div>

      <Address address={project.owner} size="small" />

      <div className={styles.line}></div>

      <div className="flex">
        <Typography variant="small" type="secondary">
          Last updated
        </Typography>
        <Typography variant="small" style={{ marginLeft: 8 }}>
          {dayjs(project.updatedTimestamp).fromNow()}
        </Typography>
      </div>
    </div>
  );
};

export default ProjectCard;
