// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectMetadata } from '../../containers';
import { useAsyncMemo } from '../../hooks';
import { ProjectMetadata } from '../../models';
import { renderAsync } from '../../utils';
import IPFSImage from '../IPFSImage';
import styles from './DeploymentInfo.module.css';

type Props = {
  project: ProjectMetadata;
  deploymentId?: string;
  deploymentVersion?: string;
};

export const DeploymentInfo: React.FC<Props> = ({ project, deploymentId, deploymentVersion }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.projectInfo}>
      <IPFSImage src={project?.image || '/static/default.project.png'} className={styles.ipfsImage} />
      <div className={styles.projectTextInfo}>
        <Typography variant="large">{project.name}</Typography>
        <Typography variant="small" className={styles.text}>{`${t('projects.deploymentId')}: ${
          deploymentId ?? '-'
        }`}</Typography>
      </div>
    </div>
  );
};

export const DeploymentMeta: React.FC<{ deploymentId: string; projectMetadata?: string }> = ({
  deploymentId,
  projectMetadata,
}) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(async () => {
    if (!projectMetadata) return null;
    return await getMetadataFromCid(projectMetadata);
  }, [projectMetadata]);

  return renderAsync(metadata, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load project info: ${e}`}</Typography>,
    data: (projectMeta) => {
      if (!projectMeta) {
        return <Typography>Project metadata not found</Typography>;
      }

      return <DeploymentInfo deploymentId={deploymentId} project={projectMeta} />;
    },
  });
};
