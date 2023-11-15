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
  const ipfsImage = React.useMemo(() => {
    if (!project.metadata) {
      return '';
    }

    if (!project.metadata.image) return '/static/default.project.png';

    return project.metadata.image;
  }, [project.metadata]);

  return (
    <div className={styles.card} onClick={onClick}>
      <IPFSImage
        src={ipfsImage}
        className={styles.image}
        renderPlaceholder={() => <div style={{ width: '100%', height: '205px', background: '#fff' }}></div>}
      />
      <div style={{ flex: 1 }}>
        <Typography style={{ marginTop: 16, marginBottom: 6, height: 48 }} weight={600}>
          {project.metadata?.name || project.id}
        </Typography>
      </div>

      <Address address={project.owner} size="small" />

      <div className={styles.line}></div>
      <div className="flex" style={{ marginBottom: 12 }}>
        <div className="flex">
          <Typography variant="small">
            {project?.deployments?.nodes.reduce((cur, add) => cur + (add?.indexers.totalCount || 0), 0)}
          </Typography>
          <Typography variant="small" type="secondary" style={{ marginLeft: 5 }}>
            Indexers
          </Typography>
        </div>
        <span style={{ flex: 1 }}></span>
        <div className="flex">
          <Typography variant="small">
            {project?.deployments?.nodes.reduce((cur, add) => cur + (add?.serviceAgreements.totalCount || 0), 0)}
          </Typography>
          <Typography variant="small" type="secondary" style={{ marginLeft: 5 }}>
            Agreements
          </Typography>
        </div>
      </div>
      {project.updatedTimestamp && (
        <div className="flex">
          <Typography variant="small" type="secondary">
            Last updated
          </Typography>
          <Typography variant="small" style={{ marginLeft: 8 }}>
            {dayjs(project.updatedTimestamp).fromNow()}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
