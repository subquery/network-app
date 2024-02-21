// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { Address, Typography } from '@subql/components';
import { ProjectFieldsFragment, ProjectType } from '@subql/network-query';
import { formatSQT } from '@subql/react-hooks';
import { formatNumber, TOKEN } from '@utils';
import dayjs from 'dayjs';

import { ProjectMetadata } from 'src/models';

import IPFSImage from '../IPFSImage';
import styles from './ProjectCard.module.css';

type Props = {
  project: { metadata: ProjectMetadata | undefined } & Omit<ProjectFieldsFragment, 'metadata'> & {
      manifest?: Manifest;
    };
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
        <Typography className="overflowEllipsis2" style={{ marginTop: 16, marginBottom: 6, height: 48 }} weight={600}>
          {project.metadata?.name || project.id}
        </Typography>
      </div>

      {project.type === ProjectType.SUBQUERY ? (
        <Address address={project.owner} size="small" />
      ) : (
        <Typography variant="small" style={{ textTransform: 'capitalize' }}>
          {project.manifest?.rpcFamily?.[0]}
          {project.manifest?.rpcFamily?.[0] && project.manifest?.nodeType && ' - '}
          {project.manifest?.nodeType}
        </Typography>
      )}

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
            {formatNumber(
              formatSQT(
                project?.deployments?.nodes?.[0]?.deploymentBoosterSummaries?.groupedAggregates?.[0]?.sum
                  ?.totalAmount || '0',
              ),
            )}{' '}
            {TOKEN}
          </Typography>
          <Typography variant="small" type="secondary" style={{ marginLeft: 5 }}>
            Boost
          </Typography>
        </div>
      </div>
      {project.updatedTimestamp && (
        <div className="flex">
          <Typography variant="small" type="secondary">
            Last updated
          </Typography>
          <Typography variant="small" style={{ marginLeft: 8 }}>
            {dayjs(project.updatedTimestamp).utc(true).fromNow()}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
